import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBox from "./SearchBox";
import axios from "axios";

const ModernNavigation = ({ user, cartItems = [], onSignOut }) => {
  const [navigationItems, setNavigationItems] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const cartItemCount = cartItems.length || 0;

  // Fetch navigation data from CMS
  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        // Fetch header navigation
        const navResponse = await axios.get("/api/navigation/header");
        if (navResponse.data.success) {
          setNavigationItems(navResponse.data.data.items || []);
        }

        // Fetch site settings for logo
        try {
          const settingsResponse = await axios.get(
            "/api/navigation/settings/site"
          );
          if (settingsResponse.data.success) {
            setSiteSettings(settingsResponse.data.data);
          }
        } catch (settingsError) {
          // Site settings are optional, continue with defaults
          console.log("Using default site settings");
        }
      } catch (error) {
        console.log("Using default navigation items");
        // Fallback to default navigation items if CMS is not available
        setNavigationItems([
          {
            label: "Home",
            url: "/",
            icon: "fa-rocket",
            isActive: true,
            order: 0,
          },
          {
            label: "Media",
            url: "/media",
            icon: "fa-play-circle",
            isActive: true,
            order: 1,
          },
          {
            label: "Games",
            url: "/games",
            icon: "fa-gamepad",
            isActive: true,
            order: 2,
          },
          {
            label: "Merch",
            url: "/products",
            icon: "fa-tshirt",
            isActive: true,
            order: 3,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationData();
  }, []);

  // Icon mapping for FontAwesome
  const getIconComponent = (iconName) => {
    const iconMap = {
      "fa-rocket": "fas fa-rocket",
      "fa-play-circle": "fas fa-play-circle",
      "fa-gamepad": "fas fa-gamepad",
      "fa-tshirt": "fas fa-tshirt",
      "fa-shopping-cart": "fas fa-shopping-cart",
      "fa-user": "fas fa-user",
      "fa-envelope": "fas fa-envelope",
      "fa-home": "fas fa-home",
      "fa-star": "fas fa-star",
      "fa-heart": "fas fa-heart",
      "fa-info-circle": "fas fa-info-circle",
      "fa-cog": "fas fa-cog",
    };
    return iconMap[iconName] || "fas fa-circle";
  };

  // Filter navigation items based on user roles
  const getVisibleNavItems = () => {
    if (loading) return [];

    return navigationItems
      .filter((item) => {
        if (!item.isActive) return false;

        // If no roles specified, show to everyone
        if (!item.roles || item.roles.length === 0) return true;

        // Check user roles
        if (!user) return item.roles.includes("guest");

        return item.roles.some((role) => {
          if (role === "admin") return user.isAdmin;
          if (role === "seller") return user.isSeller;
          if (role === "user") return true;
          return false;
        });
      })
      .sort((a, b) => a.order - b.order);
  };

  return (
    <nav className="app-header">
      <div className="container">
        <div className="flex items-center justify-between py-3">
          {/* Brand Logo - Now clickable */}
          <div className="flex items-center">
            <Link to="/" className="navbar-brand flex items-center gap-2">
              <img
                src={siteSettings?.logo || "/images/logo2.png"}
                alt={siteSettings?.siteName || "Astro Mahri"}
                className="h-6 w-auto max-h-8 object-contain"
              />
              <span className="hidden sm:inline text-primary font-semibold text-sm lg:text-base">
                {siteSettings?.siteName || "astromahrixspace"}
              </span>
            </Link>
          </div>

          {/* Search Box - Centered */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBox />
          </div>

          {/* Horizontal Navigation Menu */}
          <div className="flex items-center gap-4">
            {/* Dynamic Navigation Items with Pipe Dividers */}
            {getVisibleNavItems()
              .filter((item) => !["Cart", "Sign In"].includes(item.label)) // Filter out Cart and Sign In as they're handled separately
              .map((item, index, filteredItems) => (
                <React.Fragment key={index}>
                  {/* Only show Home text for the logo, others show text labels */}
                  {item.label === "Home" ? null : (
                    <Link
                      to={item.url}
                      className="nav-horizontal-link"
                      title={item.label}
                      target={item.target || "_self"}
                    >
                      <span className="nav-horizontal-label">{item.label}</span>
                    </Link>
                  )}
                  {/* Pipe Divider - don't show after last item */}
                  {item.label !== "Home" &&
                    index < filteredItems.length - 1 && (
                      <span className="nav-pipe-divider">|</span>
                    )}
                </React.Fragment>
              ))}

            {/* Final pipe before icons */}
            {getVisibleNavItems().filter(
              (item) => !["Cart", "Sign In"].includes(item.label)
            ).length > 1 && <span className="nav-pipe-divider">|</span>}

            {/* Cart - Icon Only */}
            <Link to="/cart" className="nav-icon-only relative" title="Cart">
              <i className="fas fa-shopping-cart"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-dark-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Pipe Divider */}
            <span className="nav-pipe-divider">|</span>

            {/* User Authentication - Icon Only */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Profile */}
                <Link
                  to="/profile"
                  className="nav-icon-only"
                  title={`Profile - ${user.name}`}
                >
                  <i className="fas fa-user"></i>
                </Link>

                {/* Seller Link */}
                {user.isSeller && (
                  <>
                    <span className="nav-pipe-divider">|</span>
                    <Link
                      to="/productlist/seller"
                      className="nav-icon-only"
                      title="Seller Dashboard"
                    >
                      <i className="fas fa-store"></i>
                    </Link>
                  </>
                )}

                {/* Admin Link */}
                {user.isAdmin && (
                  <>
                    <span className="nav-pipe-divider">|</span>
                    <Link
                      to="/cms"
                      className="nav-icon-only"
                      title="Admin Dashboard"
                    >
                      <i className="fas fa-cog"></i>
                    </Link>
                  </>
                )}

                {/* Sign Out */}
                <span className="nav-pipe-divider">|</span>
                <button
                  onClick={onSignOut}
                  className="nav-icon-only"
                  title="Sign Out"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <Link to="/signin" className="nav-icon-only" title="Sign In">
                <i className="fas fa-user"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ModernNavigation;
