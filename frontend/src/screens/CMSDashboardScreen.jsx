import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import LoadingBox from "../components/LoadingBox.jsx";
import MessageBox from "../components/MessageBox.jsx";
import { Link } from "react-router-dom";

export default function CMSDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/cms/dashboard", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      fetchDashboard();
    }
  }, [userInfo]);

  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;

  return (
    <div className="cms-dashboard">
      <div className="row">
        <div className="col-12">
          <h1 className="cosmic-header">
            <span className="neon-text">🚀 CMS Control Center</span>
          </h1>
          <p className="cosmic-subtitle">
            Manage your cosmic content from the year 2121
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row stats-grid">
        <div className="col-3">
          <div className="stat-card artists">
            <div className="stat-icon">👨‍🎨</div>
            <div className="stat-content">
              <h3>{stats?.artists || 0}</h3>
              <p>Artists</p>
              <Link to="/cms/artists" className="stat-link">
                Manage →
              </Link>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="stat-card products">
            <div className="stat-icon">🎵</div>
            <div className="stat-content">
              <h3>{stats?.products || 0}</h3>
              <p>Products</p>
              <Link to="/cms/products" className="stat-link">
                Manage →
              </Link>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="stat-card media">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <h3>{stats?.media || 0}</h3>
              <p>Media Items</p>
              <Link to="/cms/media" className="stat-link">
                Manage →
              </Link>
            </div>
          </div>
        </div>

        <div className="col-3">
          <div className="stat-card achievements">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{stats?.achievements || 0}</h3>
              <p>Achievements</p>
              <Link to="/cms/achievements" className="stat-link">
                Manage →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-6">
          <div className="quick-actions-card">
            <h2 className="neon-text">⚡ Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/cms/artists/new" className="btn btn-primary cosmic">
                <i className="fa fa-plus"></i> New Artist
              </Link>
              <Link to="/cms/products/new" className="btn btn-primary cosmic">
                <i className="fa fa-plus"></i> New Product
              </Link>
              <Link to="/cms/media/new" className="btn btn-primary cosmic">
                <i className="fa fa-plus"></i> Add Media
              </Link>
              <Link
                to="/cms/achievements/new"
                className="btn btn-primary cosmic"
              >
                <i className="fa fa-trophy"></i> Create Achievement
              </Link>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="system-status-card">
            <h2 className="neon-text">🌟 System Status</h2>
            <div className="status-items">
              <div className="status-item">
                <span className="status-indicator online"></span>
                <span>CMS API</span>
                <span className="status-text">Online</span>
              </div>
              <div className="status-item">
                <span className="status-indicator online"></span>
                <span>Content API</span>
                <span className="status-text">Cached</span>
              </div>
              <div className="status-item">
                <span className="status-indicator online"></span>
                <span>Database</span>
                <span className="status-text">Connected</span>
              </div>
              <div className="status-item">
                <span className="status-indicator online"></span>
                <span>Gaming System</span>
                <span className="status-text">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity && (
        <div className="row">
          <div className="col-12">
            <div className="recent-activity-card">
              <h2 className="neon-text">📈 Recent Activity</h2>
              <div className="activity-grid">
                {recentActivity.artists?.length > 0 && (
                  <div className="activity-section">
                    <h3>🎨 Recent Artists</h3>
                    <ul className="activity-list">
                      {recentActivity.artists.map((artist) => (
                        <li key={artist._id} className="activity-item">
                          <Link to={`/cms/artists/${artist._id}`}>
                            <strong>{artist.name}</strong>
                            <span className="activity-time">
                              {new Date(artist.updatedAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`status-badge ${artist.meta?.status}`}
                            >
                              {artist.meta?.status || "draft"}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recentActivity.products?.length > 0 && (
                  <div className="activity-section">
                    <h3>🎵 Recent Products</h3>
                    <ul className="activity-list">
                      {recentActivity.products.map((product) => (
                        <li key={product._id} className="activity-item">
                          <Link to={`/cms/products/${product._id}`}>
                            <strong>{product.name}</strong>
                            <span className="activity-time">
                              {new Date(product.updatedAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`status-badge ${product.meta?.status}`}
                            >
                              {product.meta?.status || "draft"}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recentActivity.media?.length > 0 && (
                  <div className="activity-section">
                    <h3>📱 Recent Media</h3>
                    <ul className="activity-list">
                      {recentActivity.media.map((media) => (
                        <li key={media._id} className="activity-item">
                          <Link to={`/cms/media/${media._id}`}>
                            <strong>{media.title}</strong>
                            <span className="activity-time">
                              {new Date(media.updatedAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`status-badge ${media.meta?.status}`}
                            >
                              {media.meta?.status || "draft"}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Navigation */}
      <div className="row">
        <div className="col-12">
          <div className="system-nav-card">
            <h2 className="neon-text">🎛️ System Navigation</h2>
            <div className="nav-grid">
              <Link to="/cms/config" className="nav-item">
                <i className="fa fa-cog"></i>
                <span>Site Configuration</span>
              </Link>
              <Link to="/cms/analytics" className="nav-item">
                <i className="fa fa-chart-bar"></i>
                <span>Analytics</span>
              </Link>
              <Link to="/cms/sections" className="nav-item">
                <i className="fa fa-layout"></i>
                <span>Landing Sections</span>
              </Link>
              <Link
                to="/api/cms/dashboard"
                className="nav-item"
                target="_blank"
              >
                <i className="fa fa-code"></i>
                <span>Raw API Data</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
