"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";

// Define public paths that don't require authentication
const publicPaths = ["/login", "/warranty", "/warranty/success"];

export function useAuthProtection() {
	const { isAuthenticated } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Thêm ref để theo dõi việc đã chuyển hướng hay chưa
	const hasRedirected = useRef(false);

	useEffect(() => {
		// Thêm logging để debug
		console.log("useAuthProtection: ", {
			pathname,
			isAuthenticated,
			hasRedirected: hasRedirected.current,
		});

		// Check if the current path is public
		const isPublicPath = publicPaths.some(
			(path) => pathname === path || pathname.startsWith(`${path}/`),
		);

		// Chỉ chuyển hướng nếu chưa chuyển hướng trước đó
		if (!hasRedirected.current) {
			// Path is not public and user is not authenticated
			if (!isPublicPath && !isAuthenticated) {
				console.log("Redirecting to login", { pathname, isAuthenticated });
				hasRedirected.current = true;
				// The from parameter to remember where to redirect after login
				const from = encodeURIComponent(pathname);
				router.push(`/login?from=${from}`);
			}

			// If user is authenticated and trying to access login page, redirect to home or intended destination
			if (isAuthenticated && pathname === "/login") {
				console.log("Redirecting from login to destination", {
					isAuthenticated,
				});
				hasRedirected.current = true;
				const from = searchParams.get("from");
				router.push(from ? decodeURIComponent(from) : "/");
			}
		}

		// Reset redirect flag when pathname changes
		return () => {
			hasRedirected.current = false;
		};
	}, [isAuthenticated, pathname, router, searchParams]);

	// Return authentication status for convenience
	return { isAuthenticated };
}
