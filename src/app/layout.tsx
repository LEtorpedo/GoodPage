"use client";

import React from "react";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DeveloperModeProvider } from "@/contexts/DeveloperModeContext";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { ThemeProvider, useTheme } from "next-themes";
import { themeColors } from "@/styles/theme";

// const inter = Inter({ subsets: ["latin"] });

// Define the Konami sequence string
const konamiSequence =
  "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
// Define the regex for allowed keys (Arrows and B, A - case insensitive)
const konamiAllowedKeys = /^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|b|a)$/i;
// Define the Dino sequence
const dinoSequence = "6031769";

// Component to handle Navbar animation logic
const AnimatedNavbar: React.FC = () => {
  const pathname = usePathname();
  const { isDeveloperToolsUIVisible } = useDeveloperMode();
  const isDeveloperPath = pathname.startsWith("/developer");

  const variants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: { y: "0%", opacity: 1 },
  };

  const targetVariant =
    isDeveloperPath && !isDeveloperToolsUIVisible ? "hidden" : "visible";

  // Store the initial variant determined on first render
  const initialVariant = React.useRef(targetVariant);

  return (
    <motion.div
      // Set initial based on the very first calculation
      initial={initialVariant.current}
      animate={targetVariant}
      variants={variants}
      // Increase duration
      transition={{ type: "tween", duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <Navbar />
    </motion.div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const isDinoPage = pathname === "/dino";
  const isDeveloperPath = pathname.startsWith("/developer");
  const { setTheme } = useTheme();

  // Removed isDinoPage check
  // const isDeveloperPath = pathname.startsWith("/developer");

  // Keep Konami trigger IF useCheatCode is still used
  useCheatCode(
    konamiSequence,
    () => {
      console.log(
        "[Layout] Konami cheat code triggered. Navigating to /developer..."
      );
      router.push("/developer");
    },
    konamiAllowedKeys
  );

  // Add Dino trigger
  useCheatCode(dinoSequence, () => {
    console.log("[Layout] Dino cheat code triggered. Navigating to /dino...");
    router.push("/dino");
  }); // Uses default regex (digits only)

  // Keep useEffect for developer mode class, removed dino one
  useEffect(() => {
    const bodyClassList = document.body.classList;
    if (isDeveloperPath) {
      bodyClassList.add("developer-mode-active");
    } else {
      bodyClassList.remove("developer-mode-active");
    }
    return () => {
      bodyClassList.remove("developer-mode-active");
    };
  }, [isDeveloperPath]);

  // --- Add useEffect to manage dino-active on BODY for BOTH layout paths ---
  // This needs to run regardless of which layout is rendered initially
  useEffect(() => {
    const bodyClassList = document.body.classList;
    if (isDinoPage) {
      bodyClassList.add("dino-active");
      // Remove potential conflicts from default layout
      bodyClassList.remove("developer-mode-active");
    } else {
      bodyClassList.remove("dino-active");
      // Re-apply developer mode if necessary (handled by the other useEffect)
    }
    // Cleanup remains simple for dino-active
    return () => {
      bodyClassList.remove("dino-active");
    };
  }, [isDinoPage]);

  // Keep the existing useEffect for developer-mode-active for the default layout
  useEffect(() => {
    const bodyClassList = document.body.classList;
    if (!isDinoPage && isDeveloperPath) {
      // Only apply if NOT dino page
      bodyClassList.add("developer-mode-active");
    } else if (!isDinoPage) {
      // Remove only if NOT dino page
      bodyClassList.remove("developer-mode-active");
    }
    // Cleanup only removes developer class
    return () => {
      bodyClassList.remove("developer-mode-active");
    };
  }, [isDinoPage, isDeveloperPath]); // Need isDinoPage here too

  // --- UseEffect to force dark theme on developer paths ---
  useEffect(() => {
    if (isDeveloperPath) {
      console.log("[Layout Theme] Forcing dark theme for developer path.");
      setTheme("dark");
    } else {
      // Optional: Revert to system theme for non-developer paths
      // console.log("[Layout Theme] Setting theme to system default.");
      // setTheme('system');
      // If you uncomment setTheme('system'), ensure 'theme' from useTheme()
      // isn't added as a dependency to avoid potential loops,
      // or use more complex logic to set only when transitioning *away*
      // from the developer path. For now, just forcing dark might be enough.
      // Set light theme for non-developer paths
      console.log("[Layout Theme] Setting theme to light for regular pages.");
      setTheme("light");
    }
  }, [isDeveloperPath, setTheme]); // Depend on path and setter

  if (isDinoPage) {
    return (
      <html lang="en">
        {/* We'll add the class via useEffect below */}
        <body className={`dino-page-isolated-body`}>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning className={isDeveloperPath ? "dark" : ""}>
      <body className={`flex flex-col min-h-screen ${isDeveloperPath ? "dark" : ""}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={isDeveloperPath ? "dark" : "light"}
          enableSystem={!isDeveloperPath}
          disableTransitionOnChange
          forcedTheme={isDeveloperPath ? "dark" : undefined}
        >
          <DeveloperModeProvider>
            <Navbar />
            <main className={`flex-grow pt-0 ${themeColors.themePageBg}`}>
              {children}
            </main>
            {!isDeveloperPath && <Footer />}
          </DeveloperModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
