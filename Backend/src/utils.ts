import { randomBytes } from "crypto";

// Generates a random, URL-safe string of the given length, used for share links.
// crypto.randomBytes is unpredictable (unlike Math.random), so links can't be guessed.
export function random(len: number) {
    return randomBytes(len).toString("base64url").slice(0, len);
}

/*
Notes:
1. This function generates a random string using cryptographically secure random bytes.
2. Avoid creating a `utils.ts` file to store miscellaneous functions or data without clear organization.
   - Storing unrelated or arbitrary functions and data in `utils.ts` is considered a bad practice.
   - Instead, organize functions into specific modules or files based on their purpose and usage.
3. Always aim for clean and modular code structure to improve maintainability and readability.
*/