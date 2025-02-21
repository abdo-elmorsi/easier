import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// Middleware
export default withAuth(
	async function middleware(request) {
		const { pathname } = request.nextUrl;
		const user = await getToken({ req: request, secret: process.env.JWT_SECRET });

		const isDashboardRoute = pathname.startsWith("/dashboard");
		const isAuthPage = pathname === "/login";
		const isAdminRoute = ["/dashboard/users", "/dashboard/users/add-update", "/dashboard/user-log"].includes(pathname);

		if (!user) {
			if (isDashboardRoute) {
				// Redirect unauthenticated users trying to access dashboard
				const loginUrl = new URL(`/login?call-back-url=${encodeURIComponent(pathname)}`, request.url);
				return NextResponse.redirect(loginUrl);
			}
		} else {
			// Redirect authenticated users away from login page
			if (isAuthPage) {
				return NextResponse.redirect(new URL("/", request.url));
			}

			// Restrict admin-only routes
			if (isAdminRoute && user.role !== "admin") {
				return NextResponse.redirect(new URL("/", request.url));
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized() {
				return true; // Allow all users to proceed; route access is handled in middleware
			},
		},
	}
);

// Matcher Configuration
export const config = {
	matcher: [
		"/dashboard/:path*", // Protect all routes under /dashboard
		"/login",
	],
};
