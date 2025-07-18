/**
 * Phone validation utility that EXACTLY matches backend phone_utils.py
 * This uses the same regex pattern and logic as the Python backend
 */

/**
 * EXACT copy of backend regex pattern from phone_utils.py
 */
const VIETNAM_PHONE_REGEX = /^(84|0[3|5|7|8|9])([0-9]{8})\b/;

/**
 * Special test numbers from backend (exact copy)
 */
const SPECIAL_TEST_NUMBERS = ["09999999999", "090000000", "0912345678"];

/**
 * Clean phone string - EXACT copy of backend logic
 * Removes special characters using same regex as backend: r"[-()\s\.\+]"
 */
function cleanPhoneString(phone: string): string {
  if (!phone) return "";
  
  // Convert to string and trim (matching backend)
  let phoneStr = String(phone).trim();
  
  // Remove special characters - EXACT same regex as backend
  phoneStr = phoneStr.replace(/[-()\s\.+]/g, "");
  
  return phoneStr;
}

/**
 * Normalize international formats - EXACT copy of backend logic
 */
function normalizePhoneFormat(phoneStr: string): string {
  // Handle +84 prefix (matching backend)
  if (phoneStr.startsWith("+84")) {
    return "0" + phoneStr.substring(3);
  }
  
  // Handle 84 prefix (matching backend)
  if (phoneStr.startsWith("84") && !phoneStr.startsWith("0")) {
    return "0" + phoneStr.substring(2);
  }
  
  return phoneStr;
}

/**
 * Check standard format validation - EXACT copy of backend logic
 */
function isStandardFormat(phoneStr: string): boolean {
  // Check 10-digit starting with 0[3,5,7,8,9] (matching backend)
  const is10DigitValid = (
    phoneStr.startsWith("0") &&
    phoneStr.length === 10 &&
    ["3", "5", "7", "8", "9"].includes(phoneStr[1])
  );
  
  // Check 9-digit starting with [3,5,7,8,9] (matching backend)
  const is9DigitValid = (
    !phoneStr.startsWith("0") &&
    phoneStr.length === 9 &&
    ["3", "5", "7", "8", "9"].includes(phoneStr[0])
  );
  
  return is10DigitValid || is9DigitValid;
}

/**
 * Validates Vietnamese phone number - EXACT copy of backend is_valid_phone function
 * @param phone - Phone number to validate
 * @returns boolean indicating if phone is valid
 */
export function isValidPhoneVN(phone: string): boolean {
  if (!phone) return false;

  // Step 1: Clean phone string (exact copy of backend)
  let phoneStr = cleanPhoneString(phone);

  // Step 2: Check special test numbers (exact copy of backend)
  if (SPECIAL_TEST_NUMBERS.includes(phoneStr)) {
    return true;
  }

  // Step 3: Normalize international formats (exact copy of backend)
  phoneStr = normalizePhoneFormat(phoneStr);

  // Step 4: Check standard formats (exact copy of backend)
  if (isStandardFormat(phoneStr)) {
    return true;
  }

  // Step 5: Final regex check (exact copy of backend)
  return VIETNAM_PHONE_REGEX.test(phoneStr);
}

/**
 * Formats Vietnamese phone number to 10-digit format with leading zero
 * @param phone - Phone number to format
 * @returns formatted phone number (10 digits with 0 prefix) or null if invalid
 */
export function formatPhoneNumberVN(phone: string): string | null {
  if (!phone) return null;

  // Step 1: Clean phone string (exact copy of backend)
  let phoneStr = cleanPhoneString(phone);

  // Step 2: Handle special test numbers (exact copy of backend)
  if (SPECIAL_TEST_NUMBERS.includes(phoneStr)) {
    return phoneStr;
  }

  // Step 3: Normalize international formats (exact copy of backend)
  phoneStr = normalizePhoneFormat(phoneStr);

  // Step 4: Handle 10-digit format starting with 0 (exact copy of backend logic)
  if (
    phoneStr.startsWith("0") &&
    phoneStr.length === 10 &&
    ["3", "5", "7", "8", "9"].includes(phoneStr[1])
  ) {
    // Backend comment: "Nếu bạn vẫn muốn giữ định dạng 10 số, sử dụng dòng sau:"
    return phoneStr; // Keep 10-digit format as per backend
  }

  // Step 5: Handle 9-digit format without 0 - ADD leading zero
  if (
    !phoneStr.startsWith("0") &&
    phoneStr.length === 9 &&
    ["3", "5", "7", "8", "9"].includes(phoneStr[0])
  ) {
    return "0" + phoneStr; // Add leading zero to make it 10-digit format
  }

  // Step 6: Final regex validation and formatting - ensure 10-digit format
  if (VIETNAM_PHONE_REGEX.test(phoneStr)) {
    if (phoneStr.startsWith("84")) {
      // Convert 84xxx to 0xxx (replace 84 with 0 prefix)
      return "0" + phoneStr.substring(2);
    } else if (phoneStr.startsWith("0")) {
      // Already has 0 prefix, keep as-is
      return phoneStr;
    }
  }

  return null;
}

/**
 * Get phone validation error message for UI
 * Uses the exact same error message as backend
 */
export function getPhoneErrorMessage(phone: string): string | null {
  if (!phone) return 'Số điện thoại là bắt buộc';
  
  if (!isValidPhoneVN(phone)) {
    // This is the exact error message from backend server.py
    return 'Số điện thoại không hợp lệ theo định dạng Việt Nam. Vui lòng kiểm tra và thử lại.';
  }
  
  return null;
}

// Test functions removed as requested
