import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = ["/login", "/warranty", "/warranty/success"];

export function middleware(request: NextRequest) {
	// Check if the path is in public paths
	const isPublicPath = publicPaths.some(
		(path) =>
			request.nextUrl.pathname === path ||
			request.nextUrl.pathname.startsWith(`${path}/`),
	);

	// Get authentication status from cookies
	const isAuthenticated =
		request.cookies.get("isAuthenticated")?.value === "true";

	// Thêm debug để kiểm tra
	console.log({
		path: request.nextUrl.pathname,
		isPublicPath,
		isAuthenticated,
		cookie: request.cookies.get("isAuthenticated"),
	});

	// Path is not public AND user is not authenticated
	if (!isPublicPath && !isAuthenticated) {
		// Store the original URL to redirect after login
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("from", request.nextUrl.pathname);
		return NextResponse.redirect(url);
	}

	// User is authenticated and trying to access login page
	if (isAuthenticated && request.nextUrl.pathname === "/login") {
		const url = request.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
