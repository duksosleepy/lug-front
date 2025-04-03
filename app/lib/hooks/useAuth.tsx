"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";

// Define public paths that don't require authentication
const publicPaths = ["/login", "/warranty", "/warranty/success"];

export function useAuthProtection() {
	const { isAuthenticated } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check if the current path is public
		const isPublicPath = publicPaths.some(
			(path) => pathname === path || pathname.startsWith(`${path}/`),
		);

		// If the path requires authentication and user is not authenticated
		if (!isPublicPath && !isAuthenticated) {
			// The from parameter to remember where to redirect after login
			const from = encodeURIComponent(pathname);
			router.push(`/login?from=${from}`);
		}

		// If user is authenticated and trying to access login page, redirect to home or intended destination
		if (isAuthenticated && pathname === "/login") {
			const from = searchParams.get("from");
			router.push(from ? decodeURIComponent(from) : "/");
		}
	}, [isAuthenticated, pathname, router, searchParams]);

	// Return authentication status for convenience
	return { isAuthenticated };
}
