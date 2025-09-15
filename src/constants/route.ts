const URLS = Object.freeze({
	HOME: "/",
	LOGIN: "/login",
	DASHBOARD: "/dashboard",
	FORBIDDEN: "/forbidden",
	PASSWORD_FORGOT: "/password/forgot",
	PASSWORD_RESET: "/password/reset",
	PASSWORD_VERIFY: "/password/verify",
});

const PUBLIC_ROUTES = Object.freeze([
	URLS.LOGIN,
	URLS.PASSWORD_FORGOT,
	URLS.PASSWORD_RESET,
	URLS.PASSWORD_VERIFY,
	URLS.FORBIDDEN,
]);

export const PREFIX = "/examiner";

const PRIVATE_ROUTES = Object.freeze([URLS.DASHBOARD]);

export { URLS, PUBLIC_ROUTES, PRIVATE_ROUTES };

export const createRoute = (route: string) => {
	if (!route.startsWith(PREFIX)) {
		return PREFIX + route;
	}
	return route;
};