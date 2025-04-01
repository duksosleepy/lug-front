"use client";

import {
	createContext,
	useState,
	useContext,
	useEffect,
	type ReactNode,
} from "react";
import Cookies from "js-cookie";

// Define the shape of our authentication context
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

// Create the context with default values
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

// Maximum failed attempts before lockout
const MAX_ATTEMPTS = 5;
// Lockout duration in milliseconds (15 minutes)
const LOCKOUT_DURATION = 15 * 60 * 1000;
// The correct passphrase (in a real app, this would be server-side)
const CORRECT_PASSPHRASE = "secure-admin-passphrase";
// Cookie options
const COOKIE_OPTIONS = {
	expires: 7, // 7 days
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict" as const,
};

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [attempts, setAttempts] = useState<number>(0);
	const [isLocked, setIsLocked] = useState<boolean>(false);
	const [unlockTime, setUnlockTime] = useState<Date | null>(null);

	// Check cookie on initial load to restore session
	useEffect(() => {
		const authCookie = Cookies.get("isAuthenticated");
		if (authCookie === "true") {
			setIsAuthenticated(true);
		}

		// Check for account lockout
		const lockoutCookie = Cookies.get("accountLockout");
		if (lockoutCookie) {
			const lockoutData = JSON.parse(lockoutCookie);
			const now = new Date();
			const lockUntil = new Date(lockoutData.until);

			if (now < lockUntil) {
				setIsLocked(true);
				setUnlockTime(lockUntil);
				setAttempts(lockoutData.attempts);

				// Set a timeout to automatically unlock when the time is up
				const timeoutId = setTimeout(() => {
					setIsLocked(false);
					setUnlockTime(null);
					setAttempts(0);
					Cookies.remove("accountLockout");
				}, lockUntil.getTime() - now.getTime());

				return () => clearTimeout(timeoutId);
			} else {
				// Lockout period expired
				Cookies.remove("accountLockout");
			}
		}
	}, []);

	// Simulates a login request
	const login = async (passphrase: string): Promise<boolean> => {
		// Don't allow login attempts if account is locked
		if (isLocked) {
			setError("Account is temporarily locked. Please try again later.");
			return false;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Simulate API request delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Simple passphrase verification (in a real app, this would be a server call)
			if (passphrase === CORRECT_PASSPHRASE) {
				setIsAuthenticated(true);
				setAttempts(0);

				// Set authentication cookie
				Cookies.set("isAuthenticated", "true", COOKIE_OPTIONS);

				return true;
			} else {
				// Increment failed attempts
				const newAttempts = attempts + 1;
				setAttempts(newAttempts);

				// Set appropriate error message
				if (newAttempts >= MAX_ATTEMPTS) {
					// Lock the account
					const lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
					setIsLocked(true);
					setUnlockTime(lockUntil);
					setError(
						`Too many failed attempts. Your account is locked until ${lockUntil.toLocaleTimeString()}.`,
					);

					// Store lockout in cookie
					Cookies.set(
						"accountLockout",
						JSON.stringify({
							until: lockUntil.toISOString(),
							attempts: newAttempts,
						}),
						COOKIE_OPTIONS,
					);

					// Set a timeout to automatically unlock
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
		} catch (_err) {
			setError("An error occurred during login. Please try again.");
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
