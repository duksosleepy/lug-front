"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AuthHeader from "@/app/components/AuthHeader";
import { useAuthProtection } from "@/app/lib/hooks/useAuth";
import { memo } from "react";

interface AppWrapperProps {
	children: ReactNode;
}

// Public paths that don't need auth protection
const publicPaths = ["/login", "/warranty", "/warranty/success"];

const AppWrapper = memo(({ children }: AppWrapperProps) => {
	const pathname = usePathname();
	const isPublicPath = publicPaths.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);
	const { isAuthenticated } = useAuthProtection();

	// Remove debug logging in production
	if (process.env.NODE_ENV === "development") {
		console.log("AppWrapper render:", {
			pathname,
			isPublicPath,
			isAuthenticated,
		});
	}

	return (
		<>
			<AuthHeader />
			{isPublicPath && (
				<div className="text-xs text-gray-400 text-center">
					Quý khách vui lòng điền đầy đủ thông tin
				</div>
			)}
			{children}
		</>
	);
});
AppWrapper.displayName = "AppWrapper";

export default AppWrapper;
