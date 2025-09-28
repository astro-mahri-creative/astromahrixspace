import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ModernButton from "../components/ModernButton";
import ModernCard from "../components/ModernCard";
import ModernInput from "../components/ModernInput";
import axios from "axios";

const CMSNavigationScreen = () => {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const [navigationItems, setNavigationItems] = useState([]);
  const [editingNavigation, setEditingNavigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Navigation form state
  const [navigationForm, setNavigationForm] = useState({
    name: "",
    location: "header",
    description: "",
    items: [],
  });

  // Navigation item form state
  const [itemForm, setItemForm] = useState({
    label: "",
    url: "",
    icon: "",
    roles: [],
    isActive: true,
    order: 0,
    target: "_self",
  });

  const [editingItem, setEditingItem] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);

  // Predefined icons for navigation
  const iconOptions = [
    { value: "fa-rocket", label: "Rocket (Home)" },
    { value: "fa-play-circle", label: "Play Circle (Media)" },
    { value: "fa-gamepad", label: "Gamepad (Games)" },
    { value: "fa-tshirt", label: "T-Shirt (Merch)" },
    { value: "fa-shopping-cart", label: "Shopping Cart" },
    { value: "fa-user", label: "User" },
    { value: "fa-envelope", label: "Envelope (Contact)" },
    { value: "fa-info-circle", label: "Info Circle (About)" },
    { value: "fa-cog", label: "Settings" },
    { value: "fa-home", label: "Home" },
    { value: "fa-star", label: "Star" },
    { value: "fa-heart", label: "Heart" },
  ];

  const locationOptions = [
    { value: "header", label: "Header Navigation" },
    { value: "footer", label: "Footer Navigation" },
    { value: "sidebar", label: "Sidebar Navigation" },
    { value: "mobile", label: "Mobile Navigation" },
  ];

  useEffect(() => {
    fetchNavigationItems();
  }, []);

  const fetchNavigationItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/navigation", {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      setNavigationItems(data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch navigation items"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNavigation = () => {
    setEditingNavigation(null);
    setNavigationForm({
      name: "",
      location: "header",
      description: "",
      items: [],
    });
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleEditNavigation = (navigation) => {
    setEditingNavigation(navigation._id);
    setNavigationForm({
      name: navigation.name,
      location: navigation.location,
      description: navigation.description || "",
      items: navigation.items || [],
    });
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleSaveNavigation = async () => {
    try {
      setSaving(true);
      setError(null);

      const navigationData = {
        ...navigationForm,
        metadata: {
          status: "published",
        },
      };

      if (editingNavigation) {
        await axios.put(
          `/api/navigation/${editingNavigation}`,
          navigationData,
          { headers: { authorization: `Bearer ${userInfo.token}` } }
        );
        setSuccess("Navigation updated successfully");
      } else {
        await axios.post("/api/navigation", navigationData, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        setSuccess("Navigation created successfully");
      }

      setEditingNavigation(null);
      setNavigationForm({
        name: "",
        location: "header",
        description: "",
        items: [],
      });

      fetchNavigationItems();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save navigation");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNavigation = async (navigationId) => {
    if (!window.confirm("Are you sure you want to delete this navigation?"))
      return;

    try {
      await axios.delete(`/api/navigation/${navigationId}`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      setSuccess("Navigation deleted successfully");
      fetchNavigationItems();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete navigation");
    }
  };

  const handleAddItem = () => {
    setItemForm({
      label: "",
      url: "",
      icon: "",
      roles: [],
      isActive: true,
      order: navigationForm.items.length,
      target: "_self",
    });
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (index) => {
    const item = navigationForm.items[index];
    setItemForm({ ...item });
    setEditingItem(index);
    setShowItemForm(true);
  };

  const handleSaveItem = () => {
    const newItems = [...navigationForm.items];

    if (editingItem !== null) {
      newItems[editingItem] = { ...itemForm };
    } else {
      newItems.push({ ...itemForm });
    }

    setNavigationForm({
      ...navigationForm,
      items: newItems,
    });

    setShowItemForm(false);
    setEditingItem(null);
    setItemForm({
      label: "",
      url: "",
      icon: "",
      roles: [],
      isActive: true,
      order: 0,
      target: "_self",
    });
  };

  const handleDeleteItem = (index) => {
    const newItems = navigationForm.items.filter((_, i) => i !== index);
    setNavigationForm({
      ...navigationForm,
      items: newItems,
    });
  };

  const moveItem = (index, direction) => {
    const newItems = [...navigationForm.items];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newItems.length) {
      [newItems[index], newItems[newIndex]] = [
        newItems[newIndex],
        newItems[index],
      ];

      // Update order values
      newItems.forEach((item, i) => {
        item.order = i;
      });

      setNavigationForm({
        ...navigationForm,
        items: newItems,
      });
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-content">
          <div className="loading-spinner">
            Loading navigation management...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Navigation Management</h1>
          <p>Manage website navigation menus and menu items</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <strong>Success:</strong> {success}
          </div>
        )}

        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Navigation Menus</h2>
            <ModernButton
              variant="primary"
              onClick={handleCreateNavigation}
              className="admin-btn"
            >
              <i className="fas fa-plus"></i> Create Navigation
            </ModernButton>
          </div>

          <div className="admin-grid">
            {navigationItems.map((navigation) => (
              <ModernCard
                key={navigation._id}
                className="admin-card"
                header={
                  <div className="admin-card-header">
                    <h3>{navigation.name}</h3>
                    <span className="badge badge-info">
                      {navigation.location}
                    </span>
                  </div>
                }
              >
                <div className="admin-card-content">
                  <p>{navigation.description || "No description"}</p>
                  <p>
                    <strong>Items:</strong> {navigation.items?.length || 0}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {navigation.metadata?.status || "draft"}
                  </p>
                </div>
                <div className="admin-card-actions">
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditNavigation(navigation)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </ModernButton>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteNavigation(navigation._id)}
                    className="btn-danger"
                  >
                    <i className="fas fa-trash"></i> Delete
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {(editingNavigation !== null ||
          navigationForm.name ||
          navigationForm.items.length > 0) && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>
                {editingNavigation ? "Edit Navigation" : "Create Navigation"}
              </h2>
              <div>
                <ModernButton
                  variant="primary"
                  onClick={handleSaveNavigation}
                  loading={saving}
                  className="admin-btn"
                >
                  <i className="fas fa-save"></i> Save Navigation
                </ModernButton>
                <ModernButton
                  variant="ghost"
                  onClick={() => {
                    setEditingNavigation(null);
                    setNavigationForm({
                      name: "",
                      location: "header",
                      description: "",
                      items: [],
                    });
                  }}
                  className="admin-btn ml-2"
                >
                  <i className="fas fa-times"></i> Cancel
                </ModernButton>
              </div>
            </div>

            <div className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <ModernInput
                    label="Navigation Name"
                    type="text"
                    value={navigationForm.name}
                    onChange={(e) =>
                      setNavigationForm({
                        ...navigationForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Main Navigation"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Location</label>
                  <select
                    value={navigationForm.location}
                    onChange={(e) =>
                      setNavigationForm({
                        ...navigationForm,
                        location: e.target.value,
                      })
                    }
                    className="admin-select"
                  >
                    {locationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <ModernInput
                  label="Description"
                  type="text"
                  value={navigationForm.description}
                  onChange={(e) =>
                    setNavigationForm({
                      ...navigationForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this navigation"
                />
              </div>

              <div className="admin-subsection">
                <div className="admin-subsection-header">
                  <h3>Navigation Items</h3>
                  <ModernButton
                    variant="secondary"
                    onClick={handleAddItem}
                    size="sm"
                  >
                    <i className="fas fa-plus"></i> Add Item
                  </ModernButton>
                </div>

                {navigationForm.items.length === 0 ? (
                  <p className="text-muted">
                    No items added yet. Click "Add Item" to get started.
                  </p>
                ) : (
                  <div className="admin-list">
                    {navigationForm.items.map((item, index) => (
                      <div key={index} className="admin-list-item">
                        <div className="admin-list-item-content">
                          <div className="admin-list-item-main">
                            <i className="fas fa-grip-vertical drag-handle"></i>
                            {item.icon && (
                              <i className={`fas ${item.icon} item-icon`}></i>
                            )}
                            <span className="item-label">{item.label}</span>
                            <span className="item-url text-muted">
                              {item.url}
                            </span>
                          </div>
                          <div className="admin-list-item-meta">
                            {item.isActive ? (
                              <i
                                className="fas fa-eye text-success"
                                title="Active"
                              ></i>
                            ) : (
                              <i
                                className="fas fa-eye-slash text-muted"
                                title="Inactive"
                              ></i>
                            )}
                            <span className="order-badge">#{item.order}</span>
                          </div>
                        </div>
                        <div className="admin-list-item-actions">
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0}
                          >
                            <i className="fas fa-arrow-up"></i>
                          </ModernButton>
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(index, "down")}
                            disabled={index === navigationForm.items.length - 1}
                          >
                            <i className="fas fa-arrow-down"></i>
                          </ModernButton>
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(index)}
                          >
                            <i className="fas fa-edit"></i>
                          </ModernButton>
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(index)}
                            className="btn-danger"
                          >
                            <i className="fas fa-trash"></i>
                          </ModernButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showItemForm && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h3>
                  {editingItem !== null ? "Edit Menu Item" : "Add Menu Item"}
                </h3>
                <ModernButton
                  variant="ghost"
                  onClick={() => setShowItemForm(false)}
                >
                  <i className="fas fa-times"></i>
                </ModernButton>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <ModernInput
                        label="Label"
                        type="text"
                        value={itemForm.label}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            label: e.target.value,
                          })
                        }
                        placeholder="e.g., Home"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <ModernInput
                        label="URL"
                        type="text"
                        value={itemForm.url}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            url: e.target.value,
                          })
                        }
                        placeholder="e.g., /, /products, /contact"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Icon</label>
                      <select
                        value={itemForm.icon}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            icon: e.target.value,
                          })
                        }
                        className="admin-select"
                      >
                        <option value="">No Icon</option>
                        {iconOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label>Target</label>
                      <select
                        value={itemForm.target}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            target: e.target.value,
                          })
                        }
                        className="admin-select"
                      >
                        <option value="_self">Same Window</option>
                        <option value="_blank">New Window</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={itemForm.isActive}
                          onChange={(e) =>
                            setItemForm({
                              ...itemForm,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        Active
                      </label>
                    </div>
                    <div className="admin-form-group">
                      <ModernInput
                        label="Order"
                        type="number"
                        value={itemForm.order}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <ModernButton variant="primary" onClick={handleSaveItem}>
                  <i className="fas fa-save"></i> Save Item
                </ModernButton>
                <ModernButton
                  variant="ghost"
                  onClick={() => setShowItemForm(false)}
                >
                  Cancel
                </ModernButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSNavigationScreen;
