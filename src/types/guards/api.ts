import { ApiError } from "@/types/api";

/**
 * Type guard to check if a value is likely an ApiError object.
 * Performs runtime checks on the structure of the object.
 * @param err - The value to check (typically from a catch block, typed as unknown).
 * @returns true if the value conforms to the ApiError structure, false otherwise.
 */
export function isApiError(err: unknown): err is ApiError {
  if (typeof err !== "object" || err === null) {
    return false;
  }

  // Check if it has the mandatory 'message' property and it's a string
  if (!("message" in err) || typeof err.message !== "string") {
    return false;
  }

  // Check if it has the optional 'statusCode' property and it's a number or undefined, if present
  if (
    "statusCode" in err &&
    typeof err.statusCode !== "number" &&
    typeof err.statusCode !== "undefined"
  ) {
    return false;
  }

  return true;
}
