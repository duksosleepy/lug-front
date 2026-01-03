"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
	Eye,
	EyeOff,
	Key,
	Lock,
	AlertCircle,
	ChevronRight,
} from "lucide-react";
import Cookies from "js-cookie";

export default function LoginPage() {
	const [passphrase, setPassphrase] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [shakeError, setShakeError] = useState(false);
	const {
		isAuthenticated,
		login,
		error,
		isLoading,
		isLocked,
		unlockTime,
		attempts,
	} = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const inputRef = useRef<HTMLInputElement>(null);

	// Focus the input field when the page loads
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	// Check for redirect URL from query parameters
	const redirectUrl = searchParams.get("from") || "/";

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			router.push(redirectUrl);
		}

		// Check if account is locked and redirect to lockout page
		if (isLocked) {
			router.push("/login/lockout");
		}
	}, [isAuthenticated, isLocked, router, redirectUrl]);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isLocked) {
			router.push("/login/lockout");
			return;
		}

		const success = await login(passphrase);

		if (success) {
			// If remember me is checked, extend cookie expiry
			if (rememberMe) {
				// The authentication cookie is already set in the AuthContext
				// Here we can extend the expiry if needed
				const currentAuth = Cookies.get("isAuthenticated");
				if (currentAuth) {
					Cookies.set("isAuthenticated", currentAuth, {
						expires: 7, // 30 days
						secure:
							process.env.NODE_ENV === "production" &&
							process.env.USE_HTTPS === "true",
						sameSite: "lax",
						path: "/",
					});
				}
			}
		} else {
			// Trigger shake animation
			setShakeError(true);
			setTimeout(() => setShakeError(false), 500);

			// If we've reached max attempts, redirect to lockout page
			if (attempts >= 4) {
				// 5th attempt will trigger lockout
				setTimeout(() => {
					router.push("/login/lockout");
				}, 1000);
			}
		}
	};

	// Countdown timer for account lockout
	const [countdown, setCountdown] = useState<string>("");

	useEffect(() => {
		if (isLocked && unlockTime) {
			const updateCountdown = () => {
				const now = new Date();
				const diff = unlockTime.getTime() - now.getTime();

				if (diff <= 0) return "00:00";

				const minutes = Math.floor(diff / (1000 * 60));
				const seconds = Math.floor((diff % (1000 * 60)) / 1000);

				return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
			};

			setCountdown(updateCountdown());

			const intervalId = setInterval(() => {
				setCountdown(updateCountdown());
			}, 1000);

			return () => clearInterval(intervalId);
		}
	}, [isLocked, unlockTime]);

	// Background gradient animation
	const gradientVariants = {
		initial: { backgroundPosition: "0% 0%" },
		animate: {
			backgroundPosition: "100% 100%",
			transition: {
				duration: 20,
				ease: "linear",
				repeat: Number.POSITIVE_INFINITY,
				repeatType: "reverse" as const,
			},
		},
	};

	return (
		<motion.div
			className="min-h-screen flex items-center justify-center p-4"
			style={{
				background:
					"linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
				backgroundSize: "400% 400%",
			}}
			variants={gradientVariants}
			initial="initial"
			animate="animate"
		>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md"
			>
				<div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden">
					{/* Header */}
					<div className="bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white text-center">
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<motion.div
								animate={{ rotateY: [0, 360] }}
								transition={{
									duration: 2,
									delay: 0.5,
									repeat: Number.POSITIVE_INFINITY,
									repeatDelay: 10,
								}}
							>
								<Lock className="h-14 w-14 mx-auto mb-3" />
							</motion.div>
							<h1 className="text-3xl font-bold">Admin Access</h1>
							<p className="text-blue-100 mt-2">Secure login required</p>
						</motion.div>
					</div>

					{/* Login Form */}
					<div className="px-6 py-8">
						<form onSubmit={handleSubmit}>
							<div className="space-y-6">
								{/* Passphrase Input */}
								<motion.div
									initial={{ x: -20, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ delay: 0.3 }}
								>
									<label
										htmlFor="passphrase"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Passphrase
									</label>

									<motion.div
										className={`relative rounded-md shadow-sm`}
										animate={shakeError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
										transition={{ duration: 0.5 }}
									>
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<Key className="h-5 w-5 text-gray-400" />
										</div>

										<input
											ref={inputRef}
											type={showPassword ? "text" : "password"}
											id="passphrase"
											name="passphrase"
											value={passphrase}
											onChange={(e) => setPassphrase(e.target.value)}
											className={`block w-full pl-10 pr-10 py-3 border ${
												error
													? "border-red-500 focus:ring-red-500"
													: "border-gray-300 focus:ring-blue-500"
											} rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
											placeholder="Enter secure passphrase"
											disabled={isLoading || isLocked}
											required
										/>

										<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
											<motion.button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="text-gray-400 hover:text-gray-600 focus:outline-none"
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
											>
												{showPassword ? (
													<EyeOff className="h-5 w-5" />
												) : (
													<Eye className="h-5 w-5" />
												)}
											</motion.button>
										</div>
									</motion.div>
								</motion.div>

								{/* Remember Me Checkbox */}
								<motion.div
									className="flex items-center justify-between"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.4 }}
								>
									<div className="flex items-center">
										<input
											id="remember-me"
											name="remember-me"
											type="checkbox"
											checked={rememberMe}
											onChange={(e) => setRememberMe(e.target.checked)}
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
										/>
										<label
											htmlFor="remember-me"
											className="ml-2 block text-sm text-gray-700"
										>
											Remember me
										</label>
									</div>
								</motion.div>

								{/* Error Message */}
								<AnimatePresence>
									{error && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.3 }}
											className="rounded-md bg-red-50 p-4"
										>
											<div className="flex">
												<div className="flex-shrink-0">
													<AlertCircle
														className="h-5 w-5 text-red-400"
														aria-hidden="true"
													/>
												</div>
												<div className="ml-3">
													<p className="text-sm font-medium text-red-800">
														{error}
													</p>
													{isLocked && unlockTime && (
														<motion.p
															className="mt-1 text-sm text-red-700"
															animate={{ opacity: [0.5, 1, 0.5] }}
															transition={{
																duration: 2,
																repeat: Number.POSITIVE_INFINITY,
															}}
														>
															Time remaining: {countdown}
														</motion.p>
													)}
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Login Button */}
								<motion.div
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.5 }}
								>
									<motion.button
										type="submit"
										disabled={isLoading || isLocked || !passphrase}
										className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
										whileHover={
											!isLoading && !isLocked ? { scale: 1.02 } : undefined
										}
										whileTap={
											!isLoading && !isLocked ? { scale: 0.98 } : undefined
										}
									>
										{isLoading ? (
											<svg
												className="animate-spin h-5 w-5 text-white mr-2"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										) : isLocked ? (
											"Account Locked"
										) : (
											<>
												Sign In
												<ChevronRight className="ml-2 h-4 w-4" />
											</>
										)}
									</motion.button>
								</motion.div>
							</div>
						</form>
					</div>

					{/* Footer */}
					<motion.div
						className="px-6 py-4 bg-gray-50 text-center text-xs text-gray-500"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.7 }}
					>
						Secure Admin Portal • LUG.vn
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	);
}
