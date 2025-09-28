import React from "react";
import { Link } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";

const ModernProduct = ({ product, onAddToCart, onViewDetails }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <div className="product-image-container">
        <Link to={`/product/${product._id}`}>
          <OptimizedImage
            src={product.image || "/images/p1.jpg"}
            alt={product.name}
            className="product-image"
            aspectRatio="4/3"
            sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
            lazy={true}
            placeholder="blur"
          />
        </Link>
        {product.badge && <div className="product-badge">{product.badge}</div>}

        <div className="product-overlay">
          <button
            className="product-quick-view"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewDetails();
            }}
            aria-label="Quick view product"
          >
            <i className="fas fa-eye"></i>
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-header">
          <Link to={`/product/${product._id}`}>
            <h3 className="product-title">{product.name}</h3>
          </Link>

          {product.rating && (
            <div className="product-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star ${
                      i < Math.floor(product.rating) ? "filled" : "empty"
                    }`}
                  />
                ))}
              </div>
              {product.reviewCount && (
                <span className="rating-count">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        <p className="product-description">
          {product.description && product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description ||
              "Discover cosmic art and mystical experiences"}
        </p>

        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="price-original">${product.originalPrice}</span>
            )}
          </div>

          <div className="product-actions">
            <button
              className="btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={product.badge === "Out of Stock"}
              aria-label={`Add ${product.name} to cart`}
            >
              <i className="fas fa-cart-plus"></i>
              {product.badge === "Out of Stock" ? "Sold Out" : "Add to Cart"}
            </button>

            <button className="btn-favorite" aria-label="Add to wishlist">
              <i className="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProduct;
