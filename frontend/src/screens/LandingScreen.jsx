import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";
import LandingProduct from "../components/LandingProduct";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import "../styles/retro.css";
import "../styles/onepage.css";
import "../styles/sidescroller.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingScreen() {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, error, products = [] } = productList || {};

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const characterRef = useRef(null);
  const scrollPromptRef = useRef(null);
  const crtRef = useRef(null);
  const debrisRef = useRef(null);
  const groundLineRef = useRef(null);

  useEffect(() => {
    dispatch(listProducts({}));
  }, [dispatch]);

  // --- GSAP side-scroller wiring ---
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const character = characterRef.current;
    if (!viewport || !track) return;

    // Let the DOM settle before measuring
    const timer = setTimeout(() => {
      const totalScroll = track.scrollWidth - window.innerWidth;

      // Measure the nav bar so the pin sits directly below it
      const nav = document.querySelector('.app-header');
      const navHeight = nav ? nav.offsetHeight : 60;

      // Extra scroll padding so the unpin transition happens off-screen
      const endPadding = window.innerHeight;

      // Pin the viewport and scrub the track horizontally
      const mainTween = gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: viewport,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          start: `top ${navHeight}px`,   // pin when viewport hits nav bottom
          end: () => `+=${totalScroll + endPadding}`,
          invalidateOnRefresh: true,
        },
      });

      // Parallax layers at different speeds
      const layers = [
        { selector: ".parallax-layer--sky", speed: 0.01 },
        { selector: ".parallax-layer--mid-city", speed: 0.06 },
        { selector: ".parallax-layer--near-buildings", speed: 0.15 },
        { selector: ".parallax-layer--ground", speed: 0.325 },
        { selector: ".parallax-layer--foreground", speed: 0.4 },
      ];

      layers.forEach(({ selector, speed }) => {
        const el = viewport.querySelector(selector);
        if (!el) return;
        gsap.to(el, {
          x: -totalScroll * speed,
          ease: "none",
          scrollTrigger: {
            trigger: viewport,
            scrub: 1,
            end: () => `+=${totalScroll + endPadding}`,
          },
        });
      });

      // Foreground overlays + ground line — subtle parallax so nothing is static
      const fgLayers = [
        { ref: crtRef, speed: 0.004 },       // very subtle drift
        { ref: debrisRef, speed: 0.02 },      // slightly more than CRT
        { ref: groundLineRef, speed: 0.25 },  // moves with ground
      ];
      fgLayers.forEach(({ ref, speed }) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          x: -totalScroll * speed,
          ease: "none",
          scrollTrigger: {
            trigger: viewport,
            scrub: 1,
            end: () => `+=${totalScroll + endPadding}`,
          },
        });
      });

      // Character run/idle animation based on scroll velocity
      if (character) {
        const spriteEl = character.querySelector(".character-sprite");
        let lastScroll = 0;
        let rafId;

        const updateCharState = () => {
          const st = ScrollTrigger.getAll()[0];
          if (!st) return;
          const vel = Math.abs(st.getVelocity());
          if (spriteEl) {
            if (vel > 50) {
              spriteEl.className = "character-sprite character-sprite--run";
            } else {
              spriteEl.className = "character-sprite character-sprite--idle";
            }
          }
          rafId = requestAnimationFrame(updateCharState);
        };
        rafId = requestAnimationFrame(updateCharState);

        // Jump logic: character jumps via translateY (no layout shift)
        const obstacles = track.querySelectorAll(".world-obstacle");
        const jumpHeight = 180; // pixels to jump upward

        obstacles.forEach((obs) => {
          ScrollTrigger.create({
            trigger: obs,
            start: "left center",
            end: "right center",
            onEnter: () => {
              if (!character) return;
              gsap.to(character, {
                y: -jumpHeight,
                duration: 0.35,
                ease: "power2.out",
                onStart: () => {
                  if (spriteEl) spriteEl.className = "character-sprite character-sprite--jump";
                },
              });
            },
            onLeave: () => {
              if (!character) return;
              gsap.to(character, {
                y: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                  if (spriteEl) spriteEl.className = "character-sprite character-sprite--idle";
                },
              });
            },
            onEnterBack: () => {
              if (!character) return;
              gsap.to(character, {
                y: -jumpHeight,
                duration: 0.35,
                ease: "power2.out",
                onStart: () => {
                  if (spriteEl) spriteEl.className = "character-sprite character-sprite--jump";
                },
              });
            },
            onLeaveBack: () => {
              if (!character) return;
              gsap.to(character, {
                y: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                  if (spriteEl) spriteEl.className = "character-sprite character-sprite--idle";
                },
              });
            },
          });
        });

        // Hide scroll prompt after first scroll
        if (scrollPromptRef.current) {
          ScrollTrigger.create({
            trigger: viewport,
            start: "top top",
            end: "+=100",
            onLeave: () => {
              gsap.to(scrollPromptRef.current, { opacity: 0, duration: 0.3 });
            },
            onEnterBack: () => {
              gsap.to(scrollPromptRef.current, { opacity: 1, duration: 0.3 });
            },
          });
        }

        return () => {
          cancelAnimationFrame(rafId);
          ScrollTrigger.getAll().forEach((st) => st.kill());
        };
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const featured = Array.isArray(products) ? products.slice(0, 4) : [];

  return (
    <React.Fragment>
    {/* Foreground overlays — outside viewport to avoid overflow:hidden clipping */}
    <div className="fg-overlay-crt" ref={crtRef} />
    <div className="fg-overlay-debris" ref={debrisRef} />

    <div className="scroller-viewport" ref={viewportRef} id="top">

      {/* ---- Parallax Layers ---- */}
      <div className="parallax-layer parallax-layer--sky">
        <div className="pixel-stars" />
      </div>

      <div className="parallax-layer parallax-layer--mid-city" />

      <div className="parallax-layer parallax-layer--near-buildings" />

      <div className="parallax-layer parallax-layer--ground" />

      <div className="parallax-layer parallax-layer--foreground" />

      {/* ---- Ground accent line ---- */}
      <div className="ground-line" ref={groundLineRef} />

      {/* ---- Character (fixed center) ---- */}
      <div className="character-container" ref={characterRef}>
        <div className="character-sprite character-sprite--idle" />
        <div className="dj-deck" />
        <div className="mic-glow" />
      </div>

      {/* ---- Horizontal scrolling track ---- */}
      <div className="scroller-track" ref={trackRef}>

        {/* Hero (first screen) */}
        <section className="scroller-hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="retro-title">
            <span className="italic">ASTRO</span>{" "}
            <span className="accent">MAHRI</span>{" "}
            <span className="thin">.SPACE</span>
          </h1>
          <p className="retro-subtitle">
            Retro-futuristic media, games, and gear from a neon-lit future.
          </p>
        </section>

        {/* Obstacle 1: About */}
        <div className="world-obstacle">
          <span className="obstacle-label">// data_terminal</span>
          <div className="obstacle-frame">
            <h2 className="section-title">About Astro Mahri</h2>
            <p className="section-lead">
              A retro-future playground for art, music, indie games, and
              small-batch gear. Expect neon vibes, synth textures, and tactile
              merch designed for real humans.
            </p>
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              <Link className="btn-primary" to="/#media">Explore Media</Link>
              <Link className="btn-secondary" to="/#merch">Shop Merch</Link>
            </div>
          </div>
          <div className="obstacle-platform" />
        </div>

        {/* Obstacle 2: Media */}
        <div className="world-obstacle">
          <span className="obstacle-label">// holo_kiosk</span>
          <div className="obstacle-frame">
            <h2 className="section-title">Media + Content</h2>
            <p className="section-lead">
              Audio sessions, performance clips, and behind-the-scenes.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <article className="card" style={{ flex: 1 }}>
                <div className="card-body">
                  <h3>Session 01</h3>
                  <p style={{ fontSize: "0.8rem" }}>Analog synth drift.</p>
                </div>
              </article>
              <article className="card" style={{ flex: 1 }}>
                <div className="card-body">
                  <h3>Session 02</h3>
                  <p style={{ fontSize: "0.8rem" }}>Live loop performance.</p>
                </div>
              </article>
              <article className="card" style={{ flex: 1 }}>
                <div className="card-body">
                  <h3>Session 03</h3>
                  <p style={{ fontSize: "0.8rem" }}>Glitch sketches.</p>
                </div>
              </article>
            </div>
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              <Link className="btn-ghost" to="/media">View Library →</Link>
            </div>
          </div>
          <div className="obstacle-platform" />
        </div>

        {/* Obstacle 3: Games */}
        <div className="world-obstacle">
          <span className="obstacle-label">// arcade_cab</span>
          <div className="obstacle-frame">
            <h2 className="section-title">Game Library</h2>
            <p className="section-lead">
              Micro-games and experiments. Unlock achievements, compare scores,
              and discover secrets.
            </p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <article className="card" style={{ flex: 1 }}>
                <div className="card-body">
                  <h3>Frequency Match</h3>
                  <p>Align the signal — tune, listen, and lock in.</p>
                  <Link className="btn-primary" to="/games">Play Now</Link>
                </div>
              </article>
              <article className="card" style={{ flex: 1 }}>
                <div className="card-body">
                  <h3>More Experiments</h3>
                  <p>New prototypes drop regularly — stay tuned.</p>
                  <Link className="btn-secondary" to="/games">Browse Games</Link>
                </div>
              </article>
            </div>
          </div>
          <div className="obstacle-platform" />
        </div>

        {/* Obstacle 4: Merch */}
        <div className="world-obstacle">
          <span className="obstacle-label">// vend_machine</span>
          <div className="obstacle-frame" style={{ maxWidth: "700px" }}>
            <h2 className="section-title">Featured Merch</h2>
            {loading ? (
              <LoadingBox />
            ) : error ? (
              <MessageBox variant="danger">{error}</MessageBox>
            ) : (
              <div className="product-row" style={{ marginTop: "1rem" }}>
                {featured.map((p) => (
                  <LandingProduct key={p._id} product={p} />
                ))}
              </div>
            )}
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              <Link className="btn-ghost" to="/merch">See All Products →</Link>
            </div>
          </div>
          <div className="obstacle-platform" />
        </div>

        {/* Obstacle 5: Contact */}
        <div className="world-obstacle">
          <span className="obstacle-label">// comm_beacon</span>
          <div className="obstacle-frame" style={{ maxWidth: "500px" }}>
            <h2 className="section-title">HMU</h2>
            <p className="section-lead">
              Connect with us across the digital cosmos.
            </p>
            <div className="social-links" style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
              <a href="mailto:hello@astromahri.space" className="social-link email-link" title="Email">
                <i className="fas fa-envelope" aria-label="Email"></i>
              </a>
              <a href="https://bsky.app/profile/astromahri.bsky.social" className="social-link bluesky-link" title="Bluesky" target="_blank" rel="noopener noreferrer">
                <i className="fas fa-cloud" aria-label="Bluesky"></i>
              </a>
              <a href="https://instagram.com/astromahri" className="social-link instagram-link" title="Instagram" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram" aria-label="Instagram"></i>
              </a>
            </div>
          </div>
          <div className="obstacle-platform" />
        </div>

        {/* End spacer — gives room to scroll past last obstacle */}
        <div style={{ flexShrink: 0, width: "100vw" }} />
      </div>

      {/* Footer is outside the scroller — appears after scroll completes */}
    </div>

    {/* Scroll prompt — outside viewport so it doesn't affect layout */}
    <div className="scroll-prompt" ref={scrollPromptRef}>scroll</div>
    </React.Fragment>
  );
}
