const URLS = Object.freeze({
  HOME: '/',
  LOGIN: '/organization/login',
  LANDING: '/landing',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  IME_REFERRAL: '/dashboard/ime-referral',
  REFERRALS: '/dashboard/referrals',
  REFERRAL_BY_ID: '/dashboard/referrals/:id',
  FORBIDDEN: '/forbidden',
  PASSWORD_FORGOT: '/password/forgot',
  PASSWORD_RESET: '/password/reset',
  PASSWORD_VERIFY: '/password/verify',
  SUCCESS: '/claimant/availability/success',
  CASES: '/dashboard/cases',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  LOCATIONS: '/dashboard/locations',
  PERMISSIONS: '/dashboard/permissions',
  GROUPS: '/dashboard/groups',
});

const PUBLIC_ROUTES = Object.freeze([
  URLS.LOGIN,
  URLS.PASSWORD_FORGOT,
  URLS.PASSWORD_RESET,
  URLS.PASSWORD_VERIFY,
  URLS.FORBIDDEN,
]);

export const PREFIX = '/organization';

const PRIVATE_ROUTES = Object.freeze([URLS.DASHBOARD]);

export { URLS, PUBLIC_ROUTES, PRIVATE_ROUTES };

export const createRoute = (route: string) => {
  if (!route.startsWith(PREFIX)) {
    return PREFIX + route;
  }
  return route;
};
