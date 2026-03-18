import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingBox from "../components/LoadingBox.jsx";
import MessageBox from "../components/MessageBox.jsx";

export default function CMSMediaScreen() {
  const [media, setMedia] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    mediaType: "",
    category: "",
    search: "",
    sortBy: "publishDate",
    sortOrder: "desc",
  });

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.entries(filters).filter(([_, value]) => value)
      );
      const { data } = await axios.get(`/api/cms/media?${params}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setMedia(data.media);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchMedia();
    }
  }, [userInfo, filters]);

  const handleDelete = async (mediaId, mediaTitle) => {
    if (
      !window.confirm(
        `Delete media "${mediaTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/cms/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      fetchMedia();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete media");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, page: 1, [key]: value });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const mediaTypes = [
    "audio",
    "video",
    "image",
    "article",
    "session",
    "playlist",
    "interview",
  ];
  const categories = [
    "performance",
    "session",
    "behind-scenes",
    "analysis",
    "tutorial",
    "interview",
    "live",
    "studio",
  ];

  const getMediaIcon = (type) => {
    switch (type) {
      case "audio":
        return "fa-music";
      case "video":
        return "fa-video";
      case "image":
        return "fa-image";
      case "article":
        return "fa-file-text";
      case "session":
        return "fa-microphone";
      case "playlist":
        return "fa-list";
      case "interview":
        return "fa-comments";
      default:
        return "fa-file";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;

  return (
    <div className="cms-media">
      <div className="row">
        <div className="col-12">
          <div className="cms-header">
            <div>
              <h1 className="cosmic-header">
                <span className="neon-text">Media Library</span>
              </h1>
              <p className="cosmic-subtitle">
                Manage audio, video, and media content
              </p>
            </div>
            <div className="cms-actions">
              <Link to="/cms" className="btn btn-secondary">
                <i className="fa fa-arrow-left"></i> Back to Dashboard
              </Link>
              <Link to="/cms/media/new" className="btn btn-primary cosmic">
                <i className="fa fa-plus"></i> Add Media
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
                  placeholder="Search media..."
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
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={filters.mediaType}
                onChange={(e) =>
                  handleFilterChange("mediaType", e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Types</option>
                {mediaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="filter-select"
              >
                <option value="publishDate">Publish Date</option>
                <option value="updatedAt">Last Updated</option>
                <option value="title">Title</option>
                <option value="analytics.views">Views</option>
                <option value="analytics.plays">Plays</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="row">
        <div className="col-12">
          <div className="cms-table-card">
            {media.length === 0 ? (
              <div className="empty-state">
                <i className="fa fa-film fa-3x"></i>
                <h3>No Media Items Found</h3>
                <p>Add your first media item to start building your library.</p>
                <Link to="/cms/media/new" className="btn btn-primary cosmic">
                  Add Media
                </Link>
              </div>
            ) : (
              <div className="products-grid">
                {media.map((item) => (
                  <div key={item._id} className="product-card">
                    <div className="product-image">
                      {item.thumbnail?.url ? (
                        <img src={item.thumbnail.url} alt={item.title} />
                      ) : (
                        <div className="placeholder-image">
                          <i
                            className={`fa ${getMediaIcon(item.mediaType)} fa-2x`}
                          ></i>
                        </div>
                      )}
                      <div className="product-overlay">
                        <div className="status-badges">
                          <span
                            className={`status-badge ${item.meta?.status || "draft"}`}
                          >
                            {item.meta?.status || "draft"}
                          </span>
                          <span className="unlock-badge">
                            {item.mediaType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="product-content">
                      <h3 className="product-title">
                        <Link to={`/cms/media/${item._id}`}>
                          {item.title}
                        </Link>
                      </h3>

                      <div className="product-meta">
                        <span className="category">
                          <i className={`fa ${getMediaIcon(item.mediaType)}`}></i>{" "}
                          {item.category || item.mediaType}
                        </span>
                        {item.duration && (
                          <span className="price">
                            {formatDuration(item.duration)}
                          </span>
                        )}
                      </div>

                      <div className="product-stats">
                        {item.analytics?.views > 0 && (
                          <span className="stat">
                            <i className="fa fa-eye"></i>{" "}
                            {item.analytics.views}
                          </span>
                        )}
                        {item.analytics?.plays > 0 && (
                          <span className="stat">
                            <i className="fa fa-play"></i>{" "}
                            {item.analytics.plays}
                          </span>
                        )}
                        {item.analytics?.likes > 0 && (
                          <span className="stat">
                            <i className="fa fa-heart"></i>{" "}
                            {item.analytics.likes}
                          </span>
                        )}
                      </div>

                      <div className="product-description">
                        <p>{item.description}</p>
                      </div>

                      <div className="product-actions">
                        <Link
                          to={`/cms/media/${item._id}`}
                          className="btn btn-sm btn-primary"
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id, item.title)}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>

                      <div className="product-footer">
                        <small>
                          Published{" "}
                          {new Date(item.publishDate).toLocaleDateString()}
                          {item.artist?.name && ` | ${item.artist.name}`}
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
                Showing {media.length} of {pagination.total} media items
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
    </div>
  );
}
