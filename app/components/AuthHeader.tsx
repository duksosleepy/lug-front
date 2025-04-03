"use client";

import { useAuth } from "@/app/lib/AuthContext";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Image from "next/image";

export default function AuthHeader() {
	const { isAuthenticated, logout } = useAuth();
	const pathname = usePathname();

	// Don't show header on warranty and login pages
	if (
		pathname === "/warranty" ||
		pathname === "/warranty/success" ||
		pathname === "/login"
	) {
		return null;
	}

	// Only show when authenticated
	if (!isAuthenticated) {
		return null;
	}

	return (
		<motion.header
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			className="bg-white border-b border-gray-200 shadow-sm py-2 px-4 flex justify-between items-center"
		>
			<div className="flex items-center">
				<Image
					src="/logo.png"
					alt="LUG.vn Logo"
					width={120}
					height={36}
					className="h-8 w-auto"
					priority
				/>
				<span className="ml-4 text-gray-700 font-medium hidden sm:inline">
					Admin Dashboard
				</span>
			</div>

			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={logout}
				className="flex items-center text-sm text-gray-700 hover:text-red-600 transition-colors duration-200"
			>
				<LogOut className="h-4 w-4 mr-1" />
				<span>Sign Out</span>
			</motion.button>
		</motion.header>
	);
}
