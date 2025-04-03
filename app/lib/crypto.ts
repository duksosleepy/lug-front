"use client";

import CryptoJS from "crypto-js";

/**
 * Hashes a passphrase using SHA-512 algorithm
 * @param passphrase The passphrase to hash
 * @returns A hex string representation of the hash
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
	// Sử dụng crypto-js - hoạt động ở cả môi trường client và server
	return CryptoJS.SHA512(passphrase).toString();
}
