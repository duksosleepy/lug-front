"use client";

import {
	createContext,
	useState,
	useContext,
	useEffect,
	useRef,
	type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { hashPassphrase } from "@/app/lib/crypto";

interface AuthContextType {
	isAuthenticated: boolean;
	login: (passphrase: string) => Promise<boolean>;
	logout: () => void;
	error: string | null;
	isLoading: boolean;
	attempts: number;
	isLocked: boolean;
	unlockTime: Date | null;
}

const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	login: async () => false,
	logout: () => {},
	error: null,
	isLoading: false,
	attempts: 0,
	isLocked: false,
	unlockTime: null,
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const CORRECT_PASSPHRASE_HASH =
	"5192eef8166ca6e7754d3fb9876fe48021b783aad34743e6eae8166b9ca240df40050e33580e998f1b3b9ba0920507d7273af3044125c9f7d1896fc8bd13f92c";

// Enhance cookie security in AuthContext.tsx
const COOKIE_OPTIONS = {
	expires: 7,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/",
};

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Use ref to track initial mount
	const isMounted = useRef(false);

	// Set initial state based on cookie - critical for hydration
	const initialAuth =
		typeof window !== "undefined"
			? Cookies.get("isAuthenticated") === "true"
			: false;

	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [attempts, setAttempts] = useState<number>(0);
	const [isLocked, setIsLocked] = useState<boolean>(false);
	const [unlockTime, setUnlockTime] = useState<Date | null>(null);

	// Cookie change listener
	useEffect(() => {
		// Skip on initial mount
		if (!isMounted.current) {
			isMounted.current = true;
			return;
		}

		if (isAuthenticated) {
			// Ensure cookie is set when state is authenticated
			if (Cookies.get("isAuthenticated") !== "true") {
				console.log("Setting auth cookie to match state");
				Cookies.set("isAuthenticated", "true", COOKIE_OPTIONS);
			}
		} else {
			// Ensure cookie is removed when state is not authenticated
			if (Cookies.get("isAuthenticated") === "true") {
				console.log("Removing auth cookie to match state");
				Cookies.remove("isAuthenticated");
			}
		}
	}, [isAuthenticated]);

	// Add a cookie expiration check that runs periodically and on focus
	useEffect(() => {
		// Function to check if cookie is still valid
		const checkCookieStatus = () => {
			const cookieExists = Cookies.get("isAuthenticated") === "true";

			// If state says authenticated but cookie is gone, update state
			if (isAuthenticated && !cookieExists) {
				console.log("Auth cookie expired or removed, updating state");
				setIsAuthenticated(false);
				setAttempts(0); // Reset attempts when session expires
			}
		};

		// Check when window gets focus (user returns to tab)
		const handleFocus = () => {
			checkCookieStatus();
		};

		// Check status periodically (every 30 seconds)
		const intervalId = setInterval(checkCookieStatus, 30000);

		// Add focus event listener
		if (typeof window !== "undefined") {
			window.addEventListener("focus", handleFocus);
		}

		// Initial check
		checkCookieStatus();

		return () => {
			clearInterval(intervalId);
			if (typeof window !== "undefined") {
				window.removeEventListener("focus", handleFocus);
			}
		};
	}, [isAuthenticated]);

	// Check for account lockout on initial load
	useEffect(() => {
		const lockoutCookie = Cookies.get("accountLockout");
		if (lockoutCookie) {
			try {
				const lockoutData = JSON.parse(lockoutCookie);
				const now = new Date();
				const lockUntil = new Date(lockoutData.until);

				if (now < lockUntil) {
					setIsLocked(true);
					setUnlockTime(lockUntil);
					setAttempts(lockoutData.attempts);

					const timeoutId = setTimeout(() => {
						setIsLocked(false);
						setUnlockTime(null);
						setAttempts(0);
						Cookies.remove("accountLockout");
					}, lockUntil.getTime() - now.getTime());

					return () => clearTimeout(timeoutId);
				} else {
					Cookies.remove("accountLockout");
				}
			} catch (e) {
				console.error("Error parsing lockout cookie", e);
				Cookies.remove("accountLockout");
			}
		}
	}, []);

	const login = async (passphrase: string): Promise<boolean> => {
		if (isLocked) {
			setError("Account is temporarily locked. Please try again later.");
			return false;
		}

		setIsLoading(true);
		setError(null);

		try {
			await new Promise((resolve) => setTimeout(resolve, 800));
			const inputHash = await hashPassphrase(passphrase);

			if (inputHash === CORRECT_PASSPHRASE_HASH) {
				setIsAuthenticated(true);
				setAttempts(0);
				Cookies.set("isAuthenticated", "true", COOKIE_OPTIONS);

				await new Promise((resolve) =>
					setTimeout(
						resolve,
						process.env.NODE_ENV === "production" ? 500 : 100,
					),
				);
				return true;
			} else {
				const newAttempts = attempts + 1;
				setAttempts(newAttempts);

				if (newAttempts >= MAX_ATTEMPTS) {
					const lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
					setIsLocked(true);
					setUnlockTime(lockUntil);
					setError(
						`Too many failed attempts. Your account is locked until ${lockUntil.toLocaleTimeString()}.`,
					);

					Cookies.set(
						"accountLockout",
						JSON.stringify({
							until: lockUntil.toISOString(),
							attempts: newAttempts,
						}),
						COOKIE_OPTIONS,
					);

					setTimeout(() => {
						setIsLocked(false);
						setUnlockTime(null);
						setAttempts(0);
						Cookies.remove("accountLockout");
					}, LOCKOUT_DURATION);
				} else {
					setError(
						`Invalid passphrase. Attempts remaining: ${MAX_ATTEMPTS - newAttempts}`,
					);
				}
				return false;
			}
		} catch (error) {
			console.error("Login error:", error);
			setError(
				`An error occurred during login: ${error instanceof Error ? error.message : "Please try again."}`,
			);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		setIsAuthenticated(false);
		Cookies.remove("isAuthenticated");
	};

	const value = {
		isAuthenticated,
		login,
		logout,
		error,
		isLoading,
		attempts,
		isLocked,
		unlockTime,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
