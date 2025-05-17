import { useTheme } from "@/providers/theme-provider";
import "@/styles/theme-toggle.css";
import { SunIcon, MoonIcon } from "@/assets/icons/Icons";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <div className="icon">
        {theme === "light" ? (
          <SunIcon />
        ) : (
         <MoonIcon/>
        )}
      </div>
    </button>
  );
}
