import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import ModernButton from "../components/ModernButton";
import ModernCard from "../components/ModernCard";
import ModernInput from "../components/ModernInput";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function CMSMediaEditScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreating = !id || id === "new";

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [artists, setArtists] = useState([]);

  const [mediaData, setMediaData] = useState({
    title: "",
    slug: "",
    mediaType: "audio",
    category: "studio",
    description: "",
    longDescription: "",
    thumbnailUrl: "",
    mediaFileUrl: "",
    artist: "",
    duration: "",
    tags: [],
    unlockRequirement: "free",
    gameScoreRequired: 0,
    isFeatured: false,
    status: "published",
  });

  const mediaTypes = [
    { value: "audio", label: "Audio" },
    { value: "video", label: "Video" },
    { value: "image", label: "Image" },
    { value: "article", label: "Article" },
    { value: "session", label: "Session" },
    { value: "playlist", label: "Playlist" },
    { value: "interview", label: "Interview" },
  ];

  const categories = [
    { value: "performance", label: "Performance" },
    { value: "session", label: "Session" },
    { value: "behind-scenes", label: "Behind the Scenes" },
    { value: "analysis", label: "Analysis" },
    { value: "tutorial", label: "Tutorial" },
    { value: "interview", label: "Interview" },
    { value: "live", label: "Live" },
    { value: "studio", label: "Studio" },
  ];

  const unlockRequirements = [
    { value: "free", label: "Free Access" },
    { value: "purchase", label: "Purchase Required" },
    { value: "game", label: "Game Unlock" },
    { value: "subscriber", label: "Subscriber Only" },
  ];

  useEffect(() => {
    fetchArtists();
    if (!isCreating) {
      fetchMedia();
    }
  }, [id, isCreating]);

  const fetchArtists = async () => {
    try {
      const { data } = await axios.get("/api/cms/artists?limit=100", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setArtists(data.artists || []);
    } catch (err) {
      console.error("Failed to load artists:", err);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/cms/media/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      setMediaData({
        title: data.title || "",
        slug: data.slug || "",
        mediaType: data.mediaType || "audio",
        category: data.category || "studio",
        description: data.description || "",
        longDescription: data.longDescription || "",
        thumbnailUrl: data.thumbnail?.url || "",
        mediaFileUrl: data.mediaFile?.url || "",
        artist: data.artist?._id || data.artist || "",
        duration: data.duration || "",
        tags: data.tags || [],
        unlockRequirement: data.unlockConfig?.requirement || "free",
        gameScoreRequired: data.unlockConfig?.gameScoreRequired || 0,
        isFeatured: data.isFeatured || false,
        status: data.meta?.status || "published",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load media item");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setMediaData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "title" && value) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setMediaData((prev) => ({ ...prev, slug }));
    }
  };

  const handleTagsChange = (value) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setMediaData((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const submitData = {
        title: mediaData.title,
        slug: mediaData.slug,
        mediaType: mediaData.mediaType,
        category: mediaData.category,
        description: mediaData.description,
        longDescription: mediaData.longDescription,
        thumbnail: mediaData.thumbnailUrl
          ? {
              url: mediaData.thumbnailUrl,
              alt: mediaData.title,
              title: mediaData.title,
            }
          : undefined,
        mediaFile: mediaData.mediaFileUrl
          ? {
              url: mediaData.mediaFileUrl,
              alt: mediaData.title,
              title: mediaData.title,
              mimeType:
                mediaData.mediaType === "audio"
                  ? "audio/mpeg"
                  : mediaData.mediaType === "video"
                    ? "video/mp4"
                    : "application/octet-stream",
            }
          : undefined,
        artist: mediaData.artist || undefined,
        duration: mediaData.duration
          ? parseInt(mediaData.duration)
          : undefined,
        tags: mediaData.tags,
        unlockConfig: {
          requirement: mediaData.unlockRequirement,
          gameScoreRequired: parseInt(mediaData.gameScoreRequired) || 0,
        },
        isFeatured: mediaData.isFeatured,
        meta: {
          status: mediaData.status,
        },
      };

      if (isCreating) {
        await axios.post("/api/cms/media", submitData, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setSuccess("Media item created successfully!");
      } else {
        await axios.put(`/api/cms/media/${id}`, submitData, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setSuccess("Media item updated successfully!");
      }

      setTimeout(() => {
        navigate("/cms/media");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${isCreating ? "create" : "update"} media item`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingBox />;
  }

  return (
    <div className="cms-product-edit">
      <div className="row">
        <div className="col-12">
          <div className="cms-header">
            <div>
              <h1 className="cosmic-header">
                <span className="neon-text">
                  {isCreating ? "Add Media" : "Edit Media"}
                </span>
              </h1>
              <p className="cosmic-subtitle">
                {isCreating
                  ? "Add a new media item to your library"
                  : "Update media item details"}
              </p>
            </div>
            <div className="cms-actions">
              <ModernButton
                variant="secondary"
                onClick={() => navigate("/cms/media")}
              >
                <i className="fa fa-arrow-left"></i> Back to Media
              </ModernButton>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-12">
            <MessageBox variant="danger">{error}</MessageBox>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-12">
            <MessageBox variant="success">{success}</MessageBox>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Main Content */}
          <div className="col-8">
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Basic Information</h3>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <ModernInput
                      label="Title"
                      type="text"
                      value={mediaData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter media title"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <ModernInput
                      label="Slug (URL)"
                      type="text"
                      value={mediaData.slug}
                      onChange={(e) =>
                        handleInputChange("slug", e.target.value)
                      }
                      placeholder="media-url-slug"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Media Type</label>
                    <select
                      value={mediaData.mediaType}
                      onChange={(e) =>
                        handleInputChange("mediaType", e.target.value)
                      }
                      className="admin-select"
                      required
                    >
                      {mediaTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      value={mediaData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="admin-select"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    className="admin-form-input admin-form-textarea"
                    value={mediaData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Brief description..."
                    rows="3"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Long Description</label>
                  <textarea
                    className="admin-form-input admin-form-textarea"
                    value={mediaData.longDescription}
                    onChange={(e) =>
                      handleInputChange("longDescription", e.target.value)
                    }
                    placeholder="Detailed description..."
                    rows="5"
                  />
                </div>
              </div>
            </ModernCard>

            {/* Media Files */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Media Files</h3>

                <div className="admin-form-group">
                  <ModernInput
                    label="Thumbnail URL"
                    type="url"
                    value={mediaData.thumbnailUrl}
                    onChange={(e) =>
                      handleInputChange("thumbnailUrl", e.target.value)
                    }
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                {mediaData.thumbnailUrl && (
                  <div className="mb-4">
                    <img
                      src={mediaData.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="admin-form-group">
                  <ModernInput
                    label="Media File URL"
                    type="url"
                    value={mediaData.mediaFileUrl}
                    onChange={(e) =>
                      handleInputChange("mediaFileUrl", e.target.value)
                    }
                    placeholder="https://example.com/media-file.mp4"
                  />
                </div>

                <div className="admin-form-group">
                  <ModernInput
                    label="Duration (seconds)"
                    type="number"
                    min="0"
                    value={mediaData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", e.target.value)
                    }
                    placeholder="180"
                  />
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="col-4">
            {/* Status & Artist */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Publishing</h3>

                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    value={mediaData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="admin-select"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Artist</label>
                  <select
                    value={mediaData.artist}
                    onChange={(e) =>
                      handleInputChange("artist", e.target.value)
                    }
                    className="admin-select"
                  >
                    <option value="">-- Select Artist --</option>
                    {artists.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <input
                      type="checkbox"
                      checked={mediaData.isFeatured}
                      onChange={(e) =>
                        handleInputChange("isFeatured", e.target.checked)
                      }
                      style={{ marginRight: "8px" }}
                    />
                    Featured
                  </label>
                </div>
              </div>
            </ModernCard>

            {/* Access Control */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Access Control</h3>

                <div className="admin-form-group">
                  <label className="admin-form-label">Unlock Requirement</label>
                  <select
                    value={mediaData.unlockRequirement}
                    onChange={(e) =>
                      handleInputChange("unlockRequirement", e.target.value)
                    }
                    className="admin-select"
                  >
                    {unlockRequirements.map((req) => (
                      <option key={req.value} value={req.value}>
                        {req.label}
                      </option>
                    ))}
                  </select>
                </div>

                {mediaData.unlockRequirement === "game" && (
                  <div className="admin-form-group">
                    <ModernInput
                      label="Required Game Score"
                      type="number"
                      min="0"
                      value={mediaData.gameScoreRequired}
                      onChange={(e) =>
                        handleInputChange("gameScoreRequired", e.target.value)
                      }
                      placeholder="150"
                    />
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Tags */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Tags</h3>
                <div className="admin-form-group">
                  <ModernInput
                    label="Tags (comma-separated)"
                    type="text"
                    value={mediaData.tags.join(", ")}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="live, performance, hip-hop"
                  />
                </div>
              </div>
            </ModernCard>
          </div>
        </div>

        {/* Submit */}
        <div className="row">
          <div className="col-12">
            <div className="admin-actions">
              <ModernButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                className="cosmic"
              >
                {saving ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr-2"></i>
                    {isCreating ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <i className="fa fa-save mr-2"></i>
                    {isCreating ? "Create Media" : "Update Media"}
                  </>
                )}
              </ModernButton>

              <ModernButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate("/cms/media")}
                disabled={saving}
              >
                Cancel
              </ModernButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
