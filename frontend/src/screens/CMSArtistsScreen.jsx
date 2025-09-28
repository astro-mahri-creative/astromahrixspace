import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingBox from "../components/LoadingBox.jsx";
import MessageBox from "../components/MessageBox.jsx";

export default function CMSArtistsScreen() {
  const [artists, setArtists] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    search: "",
  });

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const navigate = useNavigate();

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const { data } = await axios.get(`/api/cms/artists?${params}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setArtists(data.artists);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchArtists();
    }
  }, [userInfo, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1, search: e.target.search.value });
  };

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, page: 1, status });
  };

  const handleDelete = async (artistId, artistName) => {
    if (
      !window.confirm(
        `Delete artist "${artistName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/cms/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      fetchArtists(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete artist");
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;

  return (
    <div className="cms-artists">
      <div className="row">
        <div className="col-12">
          <div className="cms-header">
            <div>
              <h1 className="cosmic-header">
                <span className="neon-text">👨‍🎨 Artist Management</span>
              </h1>
              <p className="cosmic-subtitle">
                Manage creator profiles and portfolios
              </p>
            </div>
            <div className="cms-actions">
              <Link to="/cms" className="btn btn-secondary">
                <i className="fa fa-arrow-left"></i> Back to Dashboard
              </Link>
              <Link to="/cms/artists/new" className="btn btn-primary cosmic">
                <i className="fa fa-plus"></i> New Artist
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row">
        <div className="col-12">
          <div className="cms-filters">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                name="search"
                placeholder="Search artists..."
                defaultValue={filters.search}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                <i className="fa fa-search"></i>
              </button>
            </form>

            <div className="status-filters">
              {["all", "published", "draft", "archived"].map((status) => (
                <button
                  key={status}
                  className={`btn ${
                    filters.status === status ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => handleStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Artists List */}
      <div className="row">
        <div className="col-12">
          <div className="cms-table-card">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Status</th>
                  <th>Content</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div className="empty-state">
                        <i className="fa fa-user-astronaut fa-3x"></i>
                        <h3>No Artists Found</h3>
                        <p>Create your first artist profile to get started.</p>
                        <Link
                          to="/cms/artists/new"
                          className="btn btn-primary cosmic"
                        >
                          Create Artist
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  artists.map((artist) => (
                    <tr key={artist._id}>
                      <td>
                        <div className="artist-info">
                          {artist.avatar && (
                            <img
                              src={artist.avatar}
                              alt={artist.name}
                              className="artist-avatar"
                            />
                          )}
                          <div>
                            <strong>{artist.name}</strong>
                            <div className="artist-meta">
                              <span>{artist.slug}</span>
                              {artist.location && (
                                <span> • {artist.location}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            artist.meta?.status || "draft"
                          }`}
                        >
                          {artist.meta?.status || "draft"}
                        </span>
                        {!artist.isActive && (
                          <span className="status-badge inactive">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="content-stats">
                          {artist.portfolio?.length > 0 && (
                            <span className="stat-item">
                              <i className="fa fa-image"></i>{" "}
                              {artist.portfolio.length}
                            </span>
                          )}
                          {artist.socialLinks?.length > 0 && (
                            <span className="stat-item">
                              <i className="fa fa-link"></i>{" "}
                              {artist.socialLinks.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <div>
                            {new Date(artist.updatedAt).toLocaleDateString()}
                          </div>
                          {artist.meta?.updatedBy?.name && (
                            <small>by {artist.meta.updatedBy.name}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/cms/artists/${artist._id}`}
                            className="btn btn-sm btn-outline"
                            title="Edit Artist"
                          >
                            <i className="fa fa-edit"></i>
                          </Link>
                          <Link
                            to={`/api/content/artists/${artist.slug}`}
                            target="_blank"
                            className="btn btn-sm btn-outline"
                            title="View Public"
                          >
                            <i className="fa fa-eye"></i>
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(artist._id, artist.name)
                            }
                            className="btn btn-sm btn-danger"
                            title="Delete Artist"
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="row">
          <div className="col-12">
            <div className="cms-pagination">
              <div className="pagination-info">
                Showing {artists.length} of {pagination.total} artists
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
