import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Constants
const protectedRoutes = new Set([
	"/",
	"/users",
	"/towers",
	"/flats",
	"/opening-balance",
	"/estimated-expenses",
	"/monthly-settlement",
	"/reports/flats",
	"/settings",
]);
const authCookieName = "next-auth.session-token"; // Replace with your actual auth cookie name

// Middleware
export default withAuth(
	async function middleware(request) {
		const { pathname } = request.nextUrl;
		const session = request.cookies.get(authCookieName);

		const isAuthPage = pathname === "/login";
		const isProtectedRoute = protectedRoutes.has(pathname);

		// Redirect to login if not authenticated and trying to access a protected route
		if (!session && isProtectedRoute) {
			const loginUrl = new URL(`/login?call-back-url=${encodeURIComponent(pathname)}`, request.url);
			return NextResponse.redirect(loginUrl);
		}

		// Redirect to home if authenticated and trying to access the login page
		if (session && isAuthPage) {
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
		"/towers",
		"/flats",
		"/opening-balance",
		"/estimated-expenses",
		"/monthly-settlement",
		"/reports/flats",
		"/settings",
	],
};
