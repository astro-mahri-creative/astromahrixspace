import React from "react";

const ModernProduct = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        {product.badge && <div className="product-badge">{product.badge}</div>}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-price">
          <span className="price-current">${product.price}</span>
          {product.originalPrice && (
            <span className="price-original">${product.originalPrice}</span>
          )}
        </div>

        <div className="product-actions">
          <button className="btn-add-to-cart">Add to Cart</button>
          <button className="btn-favorite">
            <i className="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernProduct;
