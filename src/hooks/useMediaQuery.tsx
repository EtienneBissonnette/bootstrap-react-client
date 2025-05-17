import { useState, useEffect } from "react";

interface MediaQueryOptions {
  defaultValue?: boolean; // Initial value if no match
  onChange?: (matches: boolean) => void; // Callback on change
}

/**
 * A hook that returns whether a media query matches.
 *
 * @param query A media query string (e.g., '(min-width: 768px)')
 * @param options Optional configuration: defaultValue, onChange
 * @returns A boolean indicating whether the media query matches.
 */
function useMediaQuery(
  query: string,
  options: MediaQueryOptions = {}
): boolean {
  const { defaultValue = false, onChange } = options;
  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    // Check for server-side rendering
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Function to update state and call onChange callback
    const handleMatch = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
      onChange?.(event.matches);
    };

    setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", handleMatch);

    return () => {
      mediaQueryList.removeEventListener("change", handleMatch);
    };
  }, [query, onChange]);

  return matches;
}

export default useMediaQuery;
