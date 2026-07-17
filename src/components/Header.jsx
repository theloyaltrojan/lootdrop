import { useEffect, useState } from "react";

export default function Header() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("lootdrop-theme") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  function toggleTheme() {
    const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const next =
      theme === "dark" ? "light" : theme === "light" ? "dark" : sysDark ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("lootdrop-theme", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <header className="top">
      <div className="brand">
        <span className="brand-mark">LOOTDROP</span>
        <span className="brand-sub">// GamerPower feed</span>
      </div>
      <div className="top-right">
        <span className="live">
          <span className="dot" />
          Live
        </span>
        <button className="theme-btn" type="button" onClick={toggleTheme}>
          Theme
        </button>
      </div>
    </header>
  );
}
