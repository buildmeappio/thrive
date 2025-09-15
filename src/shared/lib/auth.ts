import NextAuth, { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { AuditLogService } from '@/shared/services/AuditLogService';
import type { Role, Language, UserStatus } from '@prisma/client';

const auditLogService = new AuditLogService();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your.email@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: {
              profile: true,
            },
          });

          if (!user) {
            // Log failed login attempt
            await auditLogService.log({
              action: 'LOGIN_FAILED',
              resource: 'auth',
              description: `Failed login attempt for email: ${credentials.email}`,
              severity: 'MEDIUM',
              oldValues: {
                email: credentials.email,
                reason: 'user_not_found',
              },
              ipAddress:
                (req.headers?.['x-forwarded-for'] as string) ||
                (req.headers?.['x-real-ip'] as string) ||
                '0.0.0.0',
              userAgent: req.headers?.['user-agent'],
            });
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            await auditLogService.log({
              userId: user.id,
              action: 'LOGIN_FAILED',
              resource: 'auth',
              description: 'Login attempt on inactive account',
              severity: 'HIGH',
              oldValues: {
                email: credentials.email,
                reason: 'account_inactive',
                userStatus: user.status,
              },
              ipAddress:
                (req.headers?.['x-forwarded-for'] as string) ||
                (req.headers?.['x-real-ip'] as string) ||
                '0.0.0.0',
              userAgent: req.headers?.['user-agent'],
            });
            return null;
          }

          // Check if user has a password (might be OAuth only)
          if (!user.passwordHash) {
            await auditLogService.log({
              userId: user.id,
              action: 'LOGIN_FAILED',
              resource: 'auth',
              description: 'Login attempt on account without password',
              severity: 'MEDIUM',
              oldValues: {
                email: credentials.email,
                reason: 'no_password_set',
              },
              ipAddress:
                (req.headers?.['x-forwarded-for'] as string) ||
                (req.headers?.['x-real-ip'] as string) ||
                '0.0.0.0',
              userAgent: req.headers?.['user-agent'],
            });
            return null;
          }

          // Check for account lockout
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            await auditLogService.log({
              userId: user.id,
              action: 'LOGIN_FAILED',
              resource: 'auth',
              description: 'Login attempt on locked account',
              severity: 'HIGH',
              oldValues: {
                email: credentials.email,
                reason: 'account_locked',
                lockedUntil: user.lockedUntil.toISOString(),
              },
              ipAddress:
                (req.headers?.['x-forwarded-for'] as string) ||
                (req.headers?.['x-real-ip'] as string) ||
                '0.0.0.0',
              userAgent: req.headers?.['user-agent'],
            });
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            // Increment failed login attempts
            const newAttempts = user.loginAttempts + 1;
            const shouldLock = newAttempts >= 5; // Lock after 5 failed attempts

            const updateData: { loginAttempts: number; lockedUntil?: Date } = {
              loginAttempts: newAttempts,
            };

            if (shouldLock) {
              // Lock account for 30 minutes
              updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            }

            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });

            await auditLogService.log({
              userId: user.id,
              action: 'LOGIN_FAILED',
              resource: 'auth',
              description: `Invalid password attempt ${newAttempts}/5`,
              severity: shouldLock ? 'HIGH' : 'MEDIUM',
              oldValues: {
                email: credentials.email,
                reason: 'invalid_password',
                attemptNumber: newAttempts,
                accountLocked: shouldLock,
              },
              ipAddress:
                (req.headers?.['x-forwarded-for'] as string) ||
                (req.headers?.['x-real-ip'] as string) ||
                '0.0.0.0',
              userAgent: req.headers?.['user-agent'],
            });

            return null;
          }

          // Successful login - reset failed attempts and update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
              lastLoginIp:
                (req.headers?.['x-forwarded-for'] as string) ||
                (req.headers?.['x-real-ip'] as string) ||
                '0.0.0.0',
            },
          });

          // Log successful login
          await auditLogService.log({
            userId: user.id,
            action: 'LOGIN',
            resource: 'auth',
            description: 'Successful login',
            severity: 'LOW',
            oldValues: {
              email: user.email,
              loginMethod: 'credentials',
            },
            ipAddress:
              (req.headers?.['x-forwarded-for'] as string) ||
              (req.headers?.['x-real-ip'] as string) ||
              '0.0.0.0',
            userAgent: req.headers?.['user-agent'],
          });

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            preferredLanguage: user.preferredLanguage,
            emailVerified: user.emailVerified,
            image: user.profile?.avatar || null,
          };
        } catch (error) {
          console.error('Auth error:', error);

          // Log authentication system error
          await auditLogService.log({
            action: 'SYSTEM_ACCESS',
            resource: 'auth',
            description: 'Authentication system error',
            severity: 'CRITICAL',
            oldValues: {
              error: error instanceof Error ? error.message : 'Unknown error',
              email: credentials.email,
            },
            ipAddress:
              (req.headers?.['x-forwarded-for'] as string) ||
              (req.headers?.['x-real-ip'] as string) ||
              '0.0.0.0',
            userAgent: req.headers?.['user-agent'],
          });

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Persist user data to token on sign in
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.status = user.status;
        token.preferredLanguage = user.preferredLanguage;
        token.emailVerified = user.emailVerified;
      }

      // Handle session updates (when user updates profile, etc.)
      if (trigger === 'update' && session) {
        // Refresh user data from database
        if (token.id) {
          const updatedUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { profile: true },
          });

          if (updatedUser) {
            token.firstName = updatedUser.firstName;
            token.lastName = updatedUser.lastName;
            token.role = updatedUser.role;
            token.status = updatedUser.status;
            token.preferredLanguage = updatedUser.preferredLanguage;
            token.picture = updatedUser.profile?.avatar || null;
          }
        }
      }

      return token;
    },
    session({ session, token }) {
      // Send properties to client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.role = token.role as Role;
        session.user.status = token.status as UserStatus;
        session.user.preferredLanguage = token.preferredLanguage as Language;
        session.user.emailVerified = token.emailVerified as Date | null;
      }

      return session;
    },
    redirect({ url, baseUrl }) {
      // Handle redirects after sign in/out
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default redirect to dashboard for authenticated users
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async signOut({ token }) {
      // Log logout activity
      if (token?.id) {
        await auditLogService.log({
          userId: token.id as string,
          action: 'LOGOUT',
          resource: 'auth',
          description: 'User logged out',
          severity: 'LOW',
        });
      }
    },
    async signIn({ user, account, isNewUser }) {
      // Log sign in events (OAuth, etc.)
      if (account?.provider !== 'credentials') {
        await auditLogService.log({
          userId: user.id,
          action: 'LOGIN',
          resource: 'auth',
          description: `OAuth login via ${account?.provider}`,
          severity: 'LOW',
          oldValues: {
            provider: account?.provider,
            isNewUser,
          },
        });
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
