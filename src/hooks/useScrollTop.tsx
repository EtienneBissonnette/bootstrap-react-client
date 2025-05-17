import { useEffect } from "react";

/**
 * A hook that position window to top.
 */
function useScrollToTop(): void {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

export default useScrollToTop;
