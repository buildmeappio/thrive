import { AbilityBuilder, PureAbility, type Subject } from '@casl/ability';
import type { User } from '@prisma/client';

// Define the subjects that can be acted upon
type Subjects = 'User' | 'Organization' | 'Examination' | 'Document' | 'Report' | Subject;

// Define possible actions
type Actions =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage' // represents any action
  | 'view'
  | 'edit'
  | 'approve'
  | 'submit'
  | 'download';

export type AppAbility = PureAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: User | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

  if (!user) {
    // Unauthenticated users have no permissions
    return build();
  }

  // Base permissions for all authenticated users
  can('read', 'User', { id: user.id }); // Users can read their own profile
  can('update', 'User', { id: user.id }); // Users can update their own profile

  // Role-based permissions
  switch (user.role as string) {
    case 'SUPER_ADMIN':
      can('manage', 'all'); // Super admins can do everything
      break;

    case 'MEDICAL_EXAMINER':
      // Medical examiners can manage their own examinations and documents
      can(['create', 'read', 'update'], 'Examination');
      can(['create', 'read', 'update', 'submit'], 'Document');
      can(['read', 'download'], 'Report');
      can('read', 'Organization');
      break;

    case 'ORGANIZATION_MANAGER':
      // Organization managers can manage examinations and view reports
      can(['create', 'read', 'update'], 'Examination');
      can(['read', 'approve'], 'Document');
      can(['read', 'download'], 'Report');
      // Can manage medical examiners in their organization
      can(['read', 'update'], 'User', { role: 'MEDICAL_EXAMINER' });
      break;

    case 'CLAIMANT':
      // Claimants have limited access to their own data
      can('read', 'User', { id: user.id });
      can('read', 'Examination', { claimantId: user.id });
      can('read', 'Report', { claimantId: user.id });
      break;

    default:
      // Default case for any other roles
      can('read', 'User', { id: user.id });
      break;
  }

  // Status-based restrictions
  if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
    cannot('manage', 'all');
    can('read', 'User', { id: user.id }); // Can only read own profile
  }

  if (user.status === 'PENDING_VERIFICATION') {
    // Pending users have limited access
    cannot(['create', 'update', 'delete'], 'all');
    can('read', 'User', { id: user.id });
  }

  return build();
}

// Helper function to check if user can perform action
export function checkAbility(
  ability: AppAbility,
  action: Actions,
  subject: Subjects,
  field?: string
): boolean {
  return ability.can(action, subject, field);
}
