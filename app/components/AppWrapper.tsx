"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AuthHeader from "@/app/components/AuthHeader";
import { useAuthProtection } from "@/app/lib/hooks/useAuth";

interface AppWrapperProps {
	children: ReactNode;
}

// Public paths that don't need auth protection
const publicPaths = ["/login", "/warranty", "/warranty/success"];

export default function AppWrapper({ children }: AppWrapperProps) {
	const pathname = usePathname();

	// Check if the current path is a public path
	const isPublicPath = publicPaths.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);

	// Use auth protection hook for client-side protection
	// This is a backup to the middleware for client-side navigation
	useAuthProtection();

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
}
