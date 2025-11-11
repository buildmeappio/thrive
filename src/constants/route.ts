const URLS = Object.freeze({
  HOME: "/landing",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  FORBIDDEN: "/forbidden",
  PASSWORD_FORGOT: "/password/forgot",
  PASSWORD_RESET: "/password/reset",
  PASSWORD_VERIFY: "/password/verify",
  SUPPORT: "/support",
  SETTINGS: "/settings",
  BILLING: "/billing",
  APPOINTMENTS: "/appointments",
});

const PUBLIC_ROUTES = Object.freeze([
  URLS.LOGIN,
  URLS.PASSWORD_FORGOT,
  URLS.PASSWORD_RESET,
  URLS.PASSWORD_VERIFY,
  URLS.FORBIDDEN,
  URLS.HOME,
  URLS.REGISTER,
]);

export const PREFIX = "/examiner";

const PRIVATE_ROUTES = Object.freeze([
  URLS.DASHBOARD,
  URLS.SUPPORT,
  URLS.SETTINGS,
  URLS.BILLING,
  URLS.APPOINTMENTS,
  URLS.DASHBOARD,
]);

export { URLS, PUBLIC_ROUTES, PRIVATE_ROUTES };

export const createRoute = (route: string) => {
  if (!route.startsWith(PREFIX)) {
    return PREFIX + route;
  }
  return route;
};
