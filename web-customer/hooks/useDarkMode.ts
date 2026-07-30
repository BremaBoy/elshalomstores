"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useDarkMode = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || (theme === "system" && systemTheme === "dark"));

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return { isDark, toggle, mounted };
};
