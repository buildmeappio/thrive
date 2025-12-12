const URLS = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/admin/dashboard",
  USERS: "/users",
  FORBIDDEN: "/forbidden",
  PASSWORD_FORGOT: "/password/forgot",
  PASSWORD_EMAIL_SENT: "/password/email-sent",
  PASSWORD_RESET: "/password/reset",
  PASSWORD_VERIFY: "/password/verify",
  PASSWORD_SET: "/admin/password/set",
});

const PUBLIC_ROUTES = Object.freeze([
  URLS.LOGIN,
  URLS.PASSWORD_FORGOT,
  URLS.PASSWORD_EMAIL_SENT,
  URLS.PASSWORD_RESET,
  URLS.PASSWORD_VERIFY,
  URLS.FORBIDDEN,
]);

export const PREFIX = "/admin";

const PRIVATE_ROUTES = Object.freeze([
  URLS.DASHBOARD,
  URLS.USERS,
  URLS.PASSWORD_SET,
]);

export { URLS, PUBLIC_ROUTES, PRIVATE_ROUTES };

export const createRoute = (route: string) => {
  // if (!route.includes(PREFIX)) {
  // return PREFIX + route;
  // }
  return route;
};
