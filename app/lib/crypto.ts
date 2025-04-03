// app/lib/crypto.ts
"use client";

/**
 * Hashes a passphrase using SHA-512 algorithm
 * @param passphrase The passphrase to hash
 * @returns A hex string representation of the hash
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
	// Encode the passphrase as UTF-8
	const encoder = new TextEncoder();
	const data = encoder.encode(passphrase);

	// Hash the data using SHA-512
	const hashBuffer = await crypto.subtle.digest("SHA-512", data);

	// Convert the hash to a hex string
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return hashHex;
}
