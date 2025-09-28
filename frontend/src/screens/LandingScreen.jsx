import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";
import Product from "../components/Product";
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
      <div className="retro-grid" />

      {/* Hero */}
      <section className="retro-hero section" aria-labelledby="hero-title">
        <h1 id="hero-title" className="retro-title">
          <span className="glow">ASTRO</span>
          <span className="accent">MAHRI</span>
          <span className="thin">.SPACE</span>
        </h1>
        <p className="retro-subtitle">
          Retro-futuristic media, games, and gear from a neon-lit future.
        </p>
        <nav className="retro-menu">
          <Link className="retro-tile" to="/#about">
            <span>About</span>
          </Link>
          <Link className="retro-tile" to="/#media">
            <span>Media + Content</span>
          </Link>
          <Link className="retro-tile" to="/#games">
            <span>Game Library</span>
          </Link>
          <Link className="retro-tile" to="/#merch">
            <span>Merch</span>
          </Link>
          <Link className="retro-tile" to="/#contact">
            <span>Contact</span>
          </Link>
        </nav>
      </section>

      {/* About */}
      <section id="about" className="section section-about">
        <div className="container">
          <div className="grid two">
            <div>
              <h2 className="section-title">About Astro Mahri</h2>
              <p className="section-lead">
                A retro-future playground for art, music, indie games, and small-batch gear.
                Expect neon vibes, synth textures, and tactile merch designed for real humans.
              </p>
              <div className="cta-row">
                <Link className="btn-primary" to="/#media">Explore Media</Link>
                <Link className="btn-secondary" to="/#merch">Shop Merch</Link>
              </div>
            </div>
            <div className="about-media">
              <img src="/images/logo2.png" alt="Astro Mahri Logo" className="about-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Media Preview */}
      <section id="media" className="section section-media">
        <div className="container">
          <h2 className="section-title">Media + Content</h2>
          <p className="section-lead">Audio sessions, performance clips, and behind-the-scenes.</p>
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
            <Link className="btn-ghost" to="/media">View Library →</Link>
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section id="games" className="section section-games">
        <div className="container">
          <h2 className="section-title">Game Library</h2>
          <p className="section-lead">
            Micro-games and experiments. Unlock achievements, compare scores, and discover secrets.
          </p>
          <div className="grid two">
            <article className="card">
              <div className="card-body">
                <h3>Frequency Match</h3>
                <p>Align the signal — tune, listen, and lock in.</p>
                <Link className="btn-primary" to="/games">Play Now</Link>
              </div>
            </article>
            <article className="card">
              <div className="card-body">
                <h3>More Experiments</h3>
                <p>New prototypes drop regularly — stay tuned.</p>
                <Link className="btn-secondary" to="/games">Browse Games</Link>
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
                <Product key={p._id} product={p} />
              ))}
            </div>
          )}
          <div className="cta-row">
            <Link className="btn-ghost" to="/merch">See All Products →</Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section section-contact">
        <div className="container">
          <h2 className="section-title">Contact</h2>
          <p className="section-lead">Booking, collabs, licensing — say hello.</p>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="grid two">
              <input className="input" name="name" placeholder="Your name" required />
              <input className="input" type="email" name="email" placeholder="Email" required />
            </div>
            <textarea className="input" name="message" rows="5" placeholder="Message" required />
            <div className="cta-row">
              <button className="btn-primary" type="submit">Send</button>
              <Link className="btn-secondary" to="mailto:hello@astromahri.space">Email Instead</Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
