import InvitationRegisterForm from '@/domains/auth/components/InvitationRegister';
import InvitationError from '@/domains/auth/components/InvitationError';
import getDepartments from '@/domains/auth/server/handlers/getDepartments';
import { verifyInvitationToken } from '@/domains/organization/actions';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Thrive',
  description: 'Register yourself on Thrive',
};

export const dynamic = 'force-dynamic';
export const maxDuration = 25;

interface RegisterPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

const RegisterPage = async ({ searchParams }: RegisterPageProps) => {
  const params = await searchParams;
  const token = params.token;
  const error = params.error;

  // If there's an error parameter, show error message
  if (error) {
    return (
      <InvitationError
        title="Invalid Link"
        message={
          error === 'missing_token' ? 'Invitation token is missing.' : decodeURIComponent(error)
        }
      />
    );
  }

  // If there's a token, verify it as an invitation token
  if (token) {
    try {
      const invitationResult = await verifyInvitationToken(token);

      if (invitationResult.success && invitationResult.data) {
        // Fetch departments on server side
        const departmentTypes = await getDepartments();
        // It's an invitation token - show invitation registration form
        return (
          <InvitationRegisterForm
            token={token}
            invitationData={invitationResult.data}
            departmentTypes={departmentTypes}
          />
        );
      }
      // If invitation verification fails, show error
      return (
        <InvitationError
          message={invitationResult.error || 'Invalid or expired invitation token.'}
        />
      );
    } catch {
      // If verification throws an error, show error message
      return (
        <InvitationError message="Failed to verify invitation token. It might be expired or invalid." />
      );
    }
  }

  // No token - show error message (organization registration requires invitation)
  return (
    <InvitationError
      title="Invitation Required"
      message="Organization registration is available only through invitation links sent by administrators. You cannot create an organization account without a valid invitation."
    />
  );
};

export default RegisterPage;
