import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingBox from "../components/LoadingBox.jsx";
import MessageBox from "../components/MessageBox.jsx";

export default function CMSProductsScreen() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    category: "",
    search: "",
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.entries(filters).filter(([_, value]) => value)
      );
      const { data } = await axios.get(`/api/cms/products?${params}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchProducts();
    }
  }, [userInfo, filters]);

  const handleBulkAction = async (action, productIds) => {
    if (!window.confirm(`${action} ${productIds.length} products?`)) {
      return;
    }

    try {
      await axios.post(
        "/api/cms/products/bulk",
        {
          action,
          productIds,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      fetchProducts(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} products`);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (
      !window.confirm(
        `Delete product "${productName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/cms/products/${productId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, page: 1, [key]: value });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;

  const categories = [
    "Music",
    "Exclusive Content",
    "Digital Art",
    "Merchandise",
  ];
  const contentTypes = ["music", "content", "digital-art", "physical"];

  return (
    <div className="cms-products">
      <div className="row">
        <div className="col-12">
          <div className="cms-header">
            <div>
              <h1 className="cosmic-header">
                <span className="neon-text">🎵 Product Management</span>
              </h1>
              <p className="cosmic-subtitle">
                Manage your cosmic catalog and digital offerings
              </p>
            </div>
            <div className="cms-actions">
              <Link to="/cms" className="btn btn-secondary">
                <i className="fa fa-arrow-left"></i> Back to Dashboard
              </Link>
              <Link to="/cms/products/new" className="btn btn-primary cosmic">
                <i className="fa fa-plus"></i> New Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="row">
        <div className="col-12">
          <div className="cms-filters advanced">
            <div className="filter-row">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFilterChange("search", e.target.search.value);
                }}
                className="search-form"
              >
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  defaultValue={filters.search}
                  className="search-input"
                />
                <button type="submit" className="btn btn-primary">
                  <i className="fa fa-search"></i>
                </button>
              </form>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="filter-select"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Created</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="row">
        <div className="col-12">
          <div className="cms-table-card">
            {products.length === 0 ? (
              <div className="empty-state">
                <i className="fa fa-music fa-3x"></i>
                <h3>No Products Found</h3>
                <p>Create your first product to start building your catalog.</p>
                <Link to="/cms/products/new" className="btn btn-primary cosmic">
                  Create Product
                </Link>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.media?.primaryImage ? (
                        <img
                          src={product.media.primaryImage}
                          alt={product.name}
                        />
                      ) : (
                        <div className="placeholder-image">
                          <i className="fa fa-image fa-2x"></i>
                        </div>
                      )}
                      <div className="product-overlay">
                        <div className="status-badges">
                          <span
                            className={`status-badge ${
                              product.meta?.status || "draft"
                            }`}
                          >
                            {product.meta?.status || "draft"}
                          </span>
                          {product.unlockConfig?.requirement && (
                            <span className="unlock-badge">
                              {product.unlockConfig.requirement}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="product-content">
                      <h3 className="product-title">
                        <Link to={`/cms/products/${product._id}`}>
                          {product.name}
                        </Link>
                      </h3>

                      <div className="product-meta">
                        <span className="category">{product.category}</span>
                        {product.pricing?.basePrice && (
                          <span className="price">
                            ${product.pricing.basePrice}
                          </span>
                        )}
                      </div>

                      <div className="product-stats">
                        {product.analytics?.views > 0 && (
                          <span className="stat">
                            <i className="fa fa-eye"></i>{" "}
                            {product.analytics.views}
                          </span>
                        )}
                        {product.analytics?.purchases > 0 && (
                          <span className="stat">
                            <i className="fa fa-shopping-cart"></i>{" "}
                            {product.analytics.purchases}
                          </span>
                        )}
                      </div>

                      <div className="product-description">
                        <p>
                          {product.description?.short ||
                            product.description?.main}
                        </p>
                      </div>

                      <div className="product-actions">
                        <Link
                          to={`/cms/products/${product._id}`}
                          className="btn btn-sm btn-primary"
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <Link
                          to={`/api/content/products/${product.slug}`}
                          target="_blank"
                          className="btn btn-sm btn-outline"
                        >
                          <i className="fa fa-eye"></i> View
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          className="btn btn-sm btn-danger"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>

                      <div className="product-footer">
                        <small>
                          Updated{" "}
                          {new Date(product.updatedAt).toLocaleDateString()}
                          {product.artist?.name && ` by ${product.artist.name}`}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="row">
          <div className="col-12">
            <div className="cms-pagination">
              <div className="pagination-info">
                Showing {products.length} of {pagination.total} products
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn btn-outline"
                >
                  <i className="fa fa-chevron-left"></i>
                </button>
                <span className="page-info">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!pagination.hasNext}
                  className="btn btn-outline"
                >
                  <i className="fa fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      <div className="row">
        <div className="col-12">
          <div className="bulk-actions-card">
            <h3>Bulk Actions</h3>
            <p>
              Select products above and apply actions to multiple items at once:
            </p>
            <div className="bulk-buttons">
              <button
                onClick={() =>
                  handleBulkAction(
                    "publish",
                    products.map((p) => p._id)
                  )
                }
                className="btn btn-success"
              >
                <i className="fa fa-globe"></i> Publish All Visible
              </button>
              <button
                onClick={() =>
                  handleBulkAction(
                    "archive",
                    products.map((p) => p._id)
                  )
                }
                className="btn btn-warning"
              >
                <i className="fa fa-archive"></i> Archive All Visible
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
