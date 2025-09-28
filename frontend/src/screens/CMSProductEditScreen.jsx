import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import ModernButton from "../components/ModernButton";
import ModernCard from "../components/ModernCard";
import ModernInput from "../components/ModernInput";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function CMSProductEditScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreating = !id || id === "new";

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Form state
  const [productData, setProductData] = useState({
    name: "",
    slug: "",
    category: "Music",
    price: 0,
    image: "",
    description: "",
    longDescription: "",
    features: [],
    countInStock: 999,
    brand: "Astro Mahri",
    contentType: "music",
    tags: [],
    unlockRequirement: "free",
    gameScoreRequired: 0,
    streamUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories and options
  const categories = [
    "Music",
    "Exclusive Content", 
    "Digital Art",
    "Merchandise",
  ];

  const contentTypes = [
    { value: "music", label: "Music" },
    { value: "content", label: "Content" },
    { value: "digital-art", label: "Digital Art" },
    { value: "physical", label: "Physical" },
  ];

  const unlockRequirements = [
    { value: "free", label: "Free Access" },
    { value: "purchase", label: "Purchase Required" },
    { value: "game", label: "Game Unlock" },
  ];

  useEffect(() => {
    if (!isCreating) {
      fetchProduct();
    }
  }, [id, isCreating]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Try CMS API first, fallback to regular product API
      let response;
      try {
        response = await axios.get(`/api/cms/products/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
      } catch (cmsError) {
        // Fallback to regular product API
        response = await axios.get(`/api/products/${id}`);
      }

      const product = response.data;
      setProductData({
        name: product.name || "",
        slug: product.slug || "",
        category: product.category || "Music",
        price: product.price || product.pricing?.basePrice || 0,
        image: product.image || product.media?.primaryImage || "",
        description: product.description || product.description?.short || "",
        longDescription: product.longDescription || product.description?.main || "",
        features: product.features || [],
        countInStock: product.countInStock || 999,
        brand: product.brand || "Astro Mahri",
        contentType: product.contentType || "music",
        tags: product.tags || [],
        unlockRequirement: product.unlockRequirement || "free",
        gameScoreRequired: product.gameScoreRequired || 0,
        streamUrl: product.streamUrl || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === "name" && value) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setProductData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await axios.post("/api/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      setProductData(prev => ({
        ...prev,
        image: data.image
      }));

      setSuccess("Image uploaded successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...productData.features];
    newFeatures[index] = value;
    setProductData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setProductData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeature = (index) => {
    const newFeatures = productData.features.filter((_, i) => i !== index);
    setProductData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleTagsChange = (value) => {
    const tags = value.split(",").map(tag => tag.trim()).filter(tag => tag);
    setProductData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const submitData = {
        ...productData,
        // Convert price to number
        price: parseFloat(productData.price) || 0,
        countInStock: parseInt(productData.countInStock) || 999,
        gameScoreRequired: parseInt(productData.gameScoreRequired) || 0,
        // Ensure required fields
        rating: 0,
        numReviews: 0,
        seller: userInfo._id,
      };

      if (isCreating) {
        // Create new product
        await axios.post("/api/products", submitData, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setSuccess("Product created successfully!");
      } else {
        // Update existing product
        await axios.put(`/api/products/${id}`, submitData, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setSuccess("Product updated successfully!");
      }

      // Redirect to products list after short delay
      setTimeout(() => {
        navigate("/cms/products");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isCreating ? "create" : "update"} product`);
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
                  {isCreating ? "🚀 Create Product" : "✏️ Edit Product"}
                </span>
              </h1>
              <p className="cosmic-subtitle">
                {isCreating 
                  ? "Add a new item to your cosmic catalog"
                  : "Update your product details and settings"
                }
              </p>
            </div>
            <div className="cms-actions">
              <ModernButton
                variant="secondary"
                onClick={() => navigate("/cms/products")}
              >
                <i className="fa fa-arrow-left"></i> Back to Products
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
          {/* Basic Information */}
          <div className="col-8">
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Basic Information</h3>
                
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <ModernInput
                      label="Product Name"
                      type="text"
                      value={productData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <ModernInput
                      label="Slug (URL)"
                      type="text"
                      value={productData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      placeholder="product-url-slug"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category</label>
                    <select
                      value={productData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="admin-select"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <ModernInput
                      label="Price ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    className="admin-form-input admin-form-textarea"
                    value={productData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief product description..."
                    rows="3"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Long Description</label>
                  <textarea
                    className="admin-form-input admin-form-textarea"
                    value={productData.longDescription}
                    onChange={(e) => handleInputChange("longDescription", e.target.value)}
                    placeholder="Detailed product description..."
                    rows="5"
                  />
                </div>
              </div>
            </ModernCard>

            {/* Features */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="admin-form-section-title">Features</h3>
                  <ModernButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addFeature}
                  >
                    <i className="fa fa-plus"></i> Add Feature
                  </ModernButton>
                </div>

                {productData.features.map((feature, index) => (
                  <div key={index} className="admin-form-row mb-3">
                    <div className="admin-form-group flex-1">
                      <ModernInput
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                      />
                    </div>
                    <ModernButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-error-500"
                    >
                      <i className="fa fa-trash"></i>
                    </ModernButton>
                  </div>
                ))}

                {productData.features.length === 0 && (
                  <p className="text-text-secondary text-sm">
                    No features added yet. Click "Add Feature" to get started.
                  </p>
                )}
              </div>
            </ModernCard>
          </div>

          {/* Settings & Media */}
          <div className="col-4">
            {/* Image Upload */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Product Image</h3>
                
                {productData.image && (
                  <div className="mb-4">
                    <img
                      src={productData.image}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="admin-form-group">
                  <label className="admin-form-label">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="admin-form-input"
                  />
                  {uploadingImage && (
                    <div className="mt-2 text-sm text-primary-500">
                      <i className="fa fa-spinner fa-spin mr-2"></i>
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <ModernInput
                    label="Image URL (Alternative)"
                    type="url"
                    value={productData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </ModernCard>

            {/* Settings */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Settings</h3>

                <div className="admin-form-group">
                  <label className="admin-form-label">Content Type</label>
                  <select
                    value={productData.contentType}
                    onChange={(e) => handleInputChange("contentType", e.target.value)}
                    className="admin-select"
                  >
                    {contentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Unlock Requirement</label>
                  <select
                    value={productData.unlockRequirement}
                    onChange={(e) => handleInputChange("unlockRequirement", e.target.value)}
                    className="admin-select"
                  >
                    {unlockRequirements.map((req) => (
                      <option key={req.value} value={req.value}>
                        {req.label}
                      </option>
                    ))}
                  </select>
                </div>

                {productData.unlockRequirement === "game" && (
                  <div className="admin-form-group">
                    <ModernInput
                      label="Required Game Score"
                      type="number"
                      min="0"
                      value={productData.gameScoreRequired}
                      onChange={(e) => handleInputChange("gameScoreRequired", e.target.value)}
                      placeholder="150"
                    />
                  </div>
                )}

                <div className="admin-form-group">
                  <ModernInput
                    label="Stock Count"
                    type="number"
                    min="0"
                    value={productData.countInStock}
                    onChange={(e) => handleInputChange("countInStock", e.target.value)}
                    placeholder="999"
                  />
                </div>

                <div className="admin-form-group">
                  <ModernInput
                    label="Brand"
                    type="text"
                    value={productData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Astro Mahri"
                  />
                </div>
              </div>
            </ModernCard>

            {/* Additional */}
            <ModernCard className="mb-6">
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Additional</h3>

                <div className="admin-form-group">
                  <ModernInput
                    label="Stream URL (Optional)"
                    type="url"
                    value={productData.streamUrl}
                    onChange={(e) => handleInputChange("streamUrl", e.target.value)}
                    placeholder="https://soundcloud.com/..."
                  />
                </div>

                <div className="admin-form-group">
                  <ModernInput
                    label="Tags (comma-separated)"
                    type="text"
                    value={productData.tags.join(", ")}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="hip-hop, cosmic, nerd-culture"
                  />
                </div>
              </div>
            </ModernCard>
          </div>
        </div>

        {/* Submit Actions */}
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
                    {isCreating ? "Create Product" : "Update Product"}
                  </>
                )}
              </ModernButton>

              <ModernButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate("/cms/products")}
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