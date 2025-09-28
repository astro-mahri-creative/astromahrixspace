import React from "react";
import { Link } from "react-router-dom";

export default function LandingProduct(props) {
  const { product } = props;
  return (
    <div key={product._id} className="card product-card">
      <div className="product-image-container">
        <Link to={`/product/${product._id}`}>
          <img className="medium" src={product.image} alt={product.name} />
        </Link>
      </div>
      <div className="product-info">
        <Link to={`/product/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
      </div>
    </div>
  );
}
