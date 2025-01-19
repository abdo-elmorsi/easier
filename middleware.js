import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Constants
const protectedRoutes = new Set([
	"/",
	"/users",
	"/users/add-update",

	"/towers",
	"/towers/add-update",

	"/flats",
	"/flats/add-update",

	"/opening-balance",
	"/opening-balance/add-update",

	"/estimated-expenses",
	"/estimated-expenses/add-update",

	"/settlement",
	"/settlement/add-update",

	"/flats-report",
	"/settings",
]);
const authCookieName = process.env.NODE_ENV === 'development' ? "next-auth.session-token" : "__Secure-next-auth.session-token"; // Replace with your actual auth cookie name

// Middleware
export default withAuth(
	async function middleware(request) {
		const { pathname } = request.nextUrl;
		const token = request.cookies.get(authCookieName);


		const isAuthPage = pathname === "/login";
		const isProtectedRoute = protectedRoutes.has(pathname);

		// Redirect to login if not authenticated and trying to access a protected route
		if (!token && isProtectedRoute) {
			const loginUrl = new URL(`/login?call-back-url=${encodeURIComponent(pathname)}`, request.url);
			return NextResponse.redirect(loginUrl);
		}

		// Redirect to home if authenticated and trying to access the login page
		if (token && isAuthPage) {
			return NextResponse.redirect(new URL("/", request.url));
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized() {
				return true;
			},
		},
	}
);

// Matcher Configuration
export const config = {
	matcher: [
		"/",
		"/login",
		"/users",
		"/users/add-update",

		"/towers",
		"/towers/add-update",

		"/flats",
		"/flats/add-update",

		"/opening-balance",
		"/opening-balance/add-update",

		"/estimated-expenses",
		"/estimated-expenses/add-update",

		"/settlement",
		"/settlement/add-update",

		"/flats-report",
		"/settings",
	],
};
