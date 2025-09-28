import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";
import LandingProduct from "../components/LandingProduct";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import "../styles/retro.css";
import "../styles/onepage.css";

export default function LandingScreen() {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, error, products = [] } = productList || {};

  useEffect(() => {
    // Fetch a list of products for the merch preview
    dispatch(listProducts({}));
  }, [dispatch]);

  const featured = Array.isArray(products) ? products.slice(0, 4) : [];

  return (
    <div className="retro-root" id="top">
      <div className="retro-stars" />

      {/* Hero */}
      <section className="retro-hero section" aria-labelledby="hero-title">
        <h1 id="hero-title" className="retro-title">
          <span className="italic">ASTRO</span>
          <span className="accent">MAHRI</span>
          <span className="thin">.SPACE</span>
        </h1>
        <p className="retro-subtitle">
          Retro-futuristic media, games, and gear from a neon-lit future.
        </p>
      </section>

      {/* About */}
      <section id="about" className="section section-about">
        <div className="container">
          <div className="grid two">
            <div>
              <h2 className="section-title">About Astro Mahri</h2>
              <p className="section-lead">
                A retro-future playground for art, music, indie games, and
                small-batch gear. Expect neon vibes, synth textures, and tactile
                merch designed for real humans.
              </p>
              <div className="cta-row">
                <Link className="btn-primary" to="/#media">
                  Explore Media
                </Link>
                <Link className="btn-secondary" to="/#merch">
                  Shop Merch
                </Link>
              </div>
            </div>
            <div className="about-media">
              <img
                src="/images/logo2.png"
                alt="Astro Mahri Logo"
                className="about-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Media Preview */}
      <section id="media" className="section section-media">
        <div className="container">
          <h2 className="section-title">Media + Content</h2>
          <p className="section-lead">
            Audio sessions, performance clips, and behind-the-scenes.
          </p>
          <div className="grid three">
            <article className="card">
              <img src="/images/p1.jpg" alt="Session 01" />
              <div className="card-body">
                <h3>Session 01</h3>
                <p>Analog synth drift with pixel bloom visuals.</p>
              </div>
            </article>
            <article className="card">
              <img src="/images/p2.jpg" alt="Session 02" />
              <div className="card-body">
                <h3>Session 02</h3>
                <p>Live loop performance from the Neon Atrium.</p>
              </div>
            </article>
            <article className="card">
              <img src="/images/p3.jpg" alt="Session 03" />
              <div className="card-body">
                <h3>Session 03</h3>
                <p>Glitch sketches and process notes.</p>
              </div>
            </article>
          </div>
          <div className="cta-row">
            <Link className="btn-ghost" to="/media">
              View Library →
            </Link>
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section id="games" className="section section-games">
        <div className="container">
          <h2 className="section-title">Game Library</h2>
          <p className="section-lead">
            Micro-games and experiments. Unlock achievements, compare scores,
            and discover secrets.
          </p>
          <div className="grid two">
            <article className="card">
              <div className="card-body">
                <h3>Frequency Match</h3>
                <p>Align the signal — tune, listen, and lock in.</p>
                <Link className="btn-primary" to="/games">
                  Play Now
                </Link>
              </div>
            </article>
            <article className="card">
              <div className="card-body">
                <h3>More Experiments</h3>
                <p>New prototypes drop regularly — stay tuned.</p>
                <Link className="btn-secondary" to="/games">
                  Browse Games
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Merch Preview */}
      <section id="merch" className="section section-merch">
        <div className="container">
          <h2 className="section-title">Featured Merch</h2>
          {loading ? (
            <LoadingBox />
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <div className="product-row">
              {featured.map((p) => (
                <LandingProduct key={p._id} product={p} />
              ))}
            </div>
          )}
          <div className="cta-row">
            <Link className="btn-ghost" to="/merch">
              See All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section section-contact section-compact">
        <div className="container">
          <h2 className="section-title">HMU</h2>
          <p className="section-lead">
            Connect with us across the digital cosmos.
          </p>
          <div className="social-links">
            <a
              href="mailto:hello@astromahri.space"
              className="social-link email-link"
              title="Email"
            >
              <i className="fas fa-envelope" aria-label="Email"></i>
              <span className="sr-only">Email</span>
            </a>
            <a
              href="https://bsky.app/profile/astromahri.bsky.social"
              className="social-link bluesky-link"
              title="Bluesky"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-cloud" aria-label="Bluesky"></i>
              <span className="sr-only">Bluesky</span>
            </a>
            <a
              href="https://instagram.com/astromahri"
              className="social-link instagram-link"
              title="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram" aria-label="Instagram"></i>
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="container">
          <div className="footer-content">
            <p className="footer-text">
              © 2025 Astro Mahri Space. Built for the cosmic future.
            </p>
            <div className="footer-links">
              <Link to="/privacy" className="footer-link">
                Privacy
              </Link>
              <Link to="/terms" className="footer-link">
                Terms
              </Link>
              <a href="mailto:hello@astromahri.space" className="footer-link">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Retro Grid */}
      <div className="retro-grid" />
    </div>
  );
}
