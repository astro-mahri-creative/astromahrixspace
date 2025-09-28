import React from "react";
import { Link } from "react-router-dom";

export default function MerchScreen() {
  return (
    <section style={{ padding: "1.5rem" }}>
      <h2>Merch</h2>
      <p>Shop retro-futuristic gear and accessories.</p>
      <p>
        Go to <Link to="/">Home</Link> or{" "}
        <Link to="/search/name">Browse Products</Link>.
      </p>
    </section>
  );
}
