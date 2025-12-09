/**
 * Extracts a transaction signature from an error object.
 * Solana errors sometimes include the signature even when transactions fail.
 */
export function extractTransactionSignature(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  // Check for signature in various common error properties
  const errorObj = error as Record<string, unknown>;

  // Check for signature property directly
  if (typeof errorObj.signature === "string") {
    return errorObj.signature;
  }

  // Check for signature in nested error objects
  if (errorObj.error && typeof errorObj.error === "object") {
    const nestedError = errorObj.error as Record<string, unknown>;
    if (typeof nestedError.signature === "string") {
      return nestedError.signature;
    }
  }

  // Check for transaction signature in message
  if (typeof errorObj.message === "string") {
    // Try to extract base58 signature from error message
    // Solana signatures are base58 encoded strings, typically 88 characters
    const signatureMatch = errorObj.message.match(
      /[1-9A-HJ-NP-Za-km-z]{87,88}/
    );
    if (signatureMatch) {
      return signatureMatch[0];
    }
  }

  // Check for signature in logs array
  if (Array.isArray(errorObj.logs)) {
    for (const log of errorObj.logs) {
      if (typeof log === "string") {
        const signatureMatch = log.match(/[1-9A-HJ-NP-Za-km-z]{87,88}/);
        if (signatureMatch) {
          return signatureMatch[0];
        }
      }
    }
  }

  return null;
}

/**
 * Builds a Solana explorer URL for a transaction signature.
 */
export function buildSolanaExplorerUrl(
  signature: string,
  cluster: string
): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

