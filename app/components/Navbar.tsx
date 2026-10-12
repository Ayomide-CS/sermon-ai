"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/lib/auth-context";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/sermons", label: "Sermons" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Modal states
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Toggle mobile menu — add class to BOTH toggle and links container
  const toggleMenu = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    // Also toggle the is-open class on the links container for CSS sibling selector
    const navLinks = document.getElementById("main-navigation");
    if (navLinks) {
      navLinks.classList.toggle("is-open", nextOpen);
    }
  };

  return (
    <>
      <nav className="site-nav" aria-label="Main navigation">
        <div className="site-nav__inner">
          {/* Brand */}
          <Link className="site-nav__brand" href="/" onClick={() => setIsOpen(false)}>
            🎙️ SermonAI
          </Link>

          {/* Desktop Links + Auth Buttons */}
          <div id="main-navigation" className={`site-nav__links ${isOpen ? "is-open" : ""}`}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth section — shown on desktop */}
            <div className="site-nav__auth">
              {isAuthenticated && user ? (
                <>
                  {/* User avatar dropdown */}
                  <div className="user-menu-wrapper" ref={userMenuRef}>
                    <button
                      className="user-avatar-btn"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      aria-label="User menu"
                      type="button"
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </button>
                    {showUserMenu && (
                      <div className="user-dropdown">
                        <div className="user-dropdown__header">
                          <p className="user-dropdown__name">{user.name || "User"}</p>
                          <p className="user-dropdown__email">{user.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setShowUserMenu(false)}>
                          Dashboard
                        </Link>
                        <button type="button" onClick={handleLogout}>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="btn btn--ghost"
                    onClick={() => { setShowSignIn(true); setIsOpen(false); }}
                    type="button"
                  >
                    Sign In
                  </button>
                  <button
                    className="btn btn--accent"
                    onClick={() => { setShowSignUp(true); setIsOpen(false); }}
                    type="button"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Dashboard link — only show when authenticated */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={pathname === "/dashboard" ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            aria-controls="main-navigation"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className={`site-nav__toggle ${isOpen ? "is-open" : ""}`}
            type="button"
            onClick={toggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Modals */}
      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} />
      )}
      {showSignUp && (
        <SignUpModal onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} />
      )}
    </>
  );
}
