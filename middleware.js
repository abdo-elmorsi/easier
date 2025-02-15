import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// Constants
const PROTECTED_ROUTES = new Set([
	"/",
	"/users", "/users/add-update",
	"/towers", "/towers/add-update",
	"/flats", "/flats/add-update",
	"/opening-balance", "/opening-balance/add-update",
	"/estimated-expenses", "/estimated-expenses/add-update",
	"/settlement", "/settlement/add-update",
	"/monthly-report", "/annually-report", "/tower-balances", "/user-log",
	"/profile", "/settings", "/chat"
]);

const ADMIN_ROUTES = new Set([
	"/users", "/users/add-update",
	"/user-log"
]);

// Middleware
export default withAuth(
	async function middleware(request) {
		const { pathname } = request.nextUrl;
		const user = await getToken({ req: request, secret: process.env.JWT_SECRET });

		if (!user) {
			const isProtectedRoute = PROTECTED_ROUTES.has(pathname);

			// Redirect to login if no user and accessing a protected route
			if (isProtectedRoute) {
				const loginUrl = new URL(`/login?call-back-url=${encodeURIComponent(pathname)}`, request.url);
				return NextResponse.redirect(loginUrl);
			}
		} else {
			const isAuthPage = pathname === "/login";
			const isAdminRoute = ADMIN_ROUTES.has(pathname);

			// Redirect authenticated users away from the login page
			if (isAuthPage) {
				return NextResponse.redirect(new URL("/", request.url));
			}

			// Redirect non-admin users trying to access admin-only routes
			if (isAdminRoute && user.role !== "admin") {
				return NextResponse.redirect(new URL("/", request.url));
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized() {
				return true; // Allow all users to proceed; route access is handled above
			},
		},
	}
);

// Matcher Configuration
export const config = {
	matcher: [
		"/",
		"/login",
		"/users", "/users/add-update",
		"/towers", "/towers/add-update",
		"/flats", "/flats/add-update",
		"/opening-balance", "/opening-balance/add-update",
		"/estimated-expenses", "/estimated-expenses/add-update",
		"/settlement", "/settlement/add-update",
		"/monthly-report", "/annually-report", "/tower-balances", "/user-log",
		"/profile", "/settings", "/chat"
	],
};
