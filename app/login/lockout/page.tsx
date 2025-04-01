"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Clock, ArrowLeft } from "lucide-react";
import Cookies from "js-cookie";

export default function AccountLockoutPage() {
	const [countdown, setCountdown] = useState<string>("--:--");
	const [percentage, setPercentage] = useState(100);
	const router = useRouter();

	useEffect(() => {
		// Check if the account is actually locked
		const lockoutCookie = Cookies.get("accountLockout");

		if (!lockoutCookie) {
			// Not locked, redirect to login
			router.replace("/login");
			return;
		}

		const lockoutData = JSON.parse(lockoutCookie);
		const lockUntil = new Date(lockoutData.until);
		const now = new Date();

		if (now >= lockUntil) {
			// Lockout expired, redirect to login
			Cookies.remove("accountLockout");
			router.replace("/login");
			return;
		}

		// Calculate the total lockout duration and time remaining
		const totalDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
		const remainingTime = lockUntil.getTime() - now.getTime();
		const initialPercentage = (remainingTime / totalDuration) * 100;

		setPercentage(initialPercentage);

		// Update countdown timer
		const updateCountdown = () => {
			const currentTime = new Date();
			const timeRemaining = lockUntil.getTime() - currentTime.getTime();

			if (timeRemaining <= 0) {
				// Lockout expired
				Cookies.remove("accountLockout");
				router.replace("/login");
				return;
			}

			// Calculate minutes and seconds
			const minutes = Math.floor(timeRemaining / (1000 * 60));
			const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

			// Update countdown display
			setCountdown(
				`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
			);

			// Update progress percentage
			setPercentage((timeRemaining / totalDuration) * 100);
		};

		// Initial update
		updateCountdown();

		// Set up interval for countdown
		const intervalId = setInterval(updateCountdown, 1000);

		return () => clearInterval(intervalId);
	}, [router]);

	const handleBackToLogin = () => {
		router.push("/login");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md"
			>
				<div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-8 text-white text-center">
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5 }}
						>
							<motion.div
								animate={{ rotate: [0, 5, -5, 0] }}
								transition={{
									duration: 1,
									repeat: Number.POSITIVE_INFINITY,
									repeatDelay: 2,
								}}
								className="bg-red-700 bg-opacity-60 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3"
							>
								<Lock className="h-12 w-12" />
							</motion.div>
							<h1 className="text-2xl font-bold">Account Temporarily Locked</h1>
							<p className="text-red-100 mt-2">
								Too many failed login attempts
							</p>
						</motion.div>
					</div>

					{/* Content */}
					<div className="px-6 py-8">
						<div className="text-center mb-6">
							<p className="text-gray-700 mb-4">
								For security reasons, your account has been temporarily locked.
								Please wait before trying again.
							</p>

							<div className="flex items-center justify-center gap-3 mb-6">
								<Clock className="h-5 w-5 text-red-500" />
								<div className="text-2xl font-mono font-semibold text-red-600">
									{countdown}
								</div>
							</div>

							{/* Circular progress indicator */}
							<div className="relative w-32 h-32 mx-auto mb-6">
								<svg className="w-full h-full" viewBox="0 0 100 100">
									{/* Background circle */}
									<circle
										className="text-gray-200"
										strokeWidth="8"
										stroke="currentColor"
										fill="transparent"
										r="40"
										cx="50"
										cy="50"
									/>
									{/* Progress circle */}
									<motion.circle
										className="text-red-500"
										strokeWidth="8"
										strokeLinecap="round"
										stroke="currentColor"
										fill="transparent"
										r="40"
										cx="50"
										cy="50"
										initial={{ strokeDasharray: 251.2, strokeDashoffset: 0 }}
										animate={{
											strokeDashoffset: 251.2 - (251.2 * percentage) / 100,
										}}
										transition={{ duration: 1 }}
									/>
								</svg>
								<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
									<Clock className="h-8 w-8 text-red-700" />
								</div>
							</div>

							<p className="text-gray-600 text-sm">
								Your account will automatically unlock after the countdown ends.
								You can try again at that time.
							</p>
						</div>

						<motion.button
							onClick={handleBackToLogin}
							className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Login
						</motion.button>
					</div>

					{/* Footer */}
					<motion.div
						className="px-6 py-4 bg-gray-50 text-center text-xs text-gray-500"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						This is a security measure to protect your account from unauthorized
						access.
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}
