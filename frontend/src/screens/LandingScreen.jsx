import React from "react";
import { Link } from "react-router-dom";
import "../styles/retro.css";

export default function LandingScreen() {
  return (
    <div className="retro-root">
      <div className="retro-stars" />
      <div className="retro-grid" />
      <section className="retro-hero">
        <h1 className="retro-title">
          <span className="glow">ASTRO</span>
          <span className="accent">MAHRI</span>
          <span className="thin">.SPACE</span>
        </h1>
        <p className="retro-subtitle">
          Retro-futuristic media, games, and gear from a neon-lit future.
        </p>
        <nav className="retro-menu">
          <Link className="retro-tile" to="/">
            <span>Home</span>
          </Link>
          <Link className="retro-tile" to="/media">
            <span>Media + Content</span>
          </Link>
          <Link className="retro-tile" to="/games">
            <span>Game Library</span>
          </Link>
          <Link className="retro-tile" to="/merch">
            <span>Merch</span>
          </Link>
          <Link className="retro-tile" to="/contact">
            <span>Contact</span>
          </Link>
        </nav>
      </section>
    </div>
  );
}
