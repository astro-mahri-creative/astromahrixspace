import express from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Navigation, SiteConfig } from "../models/contentModels/CMSModel.js";
import { isAuth, isAdmin } from "../utils.js";

const navigationRouter = express.Router();

// Get navigation by location (public endpoint)
navigationRouter.get(
  "/:location",
  expressAsyncHandler(async (req, res) => {
    try {
      const { location } = req.params;

      const navigation = await Navigation.findOne({
        location: location,
        isActive: true,
      }).sort({ updatedAt: -1 });

      if (!navigation) {
        return res.status(404).json({
          success: false,
          message: `Navigation not found for location: ${location}`,
        });
      }

      // Filter active items and sort by order
      const activeItems = navigation.items
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);

      res.json({
        success: true,
        data: {
          _id: navigation._id,
          name: navigation.name,
          location: navigation.location,
          items: activeItems,
        },
      });
    } catch (error) {
      console.error("Navigation fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching navigation data",
      });
    }
  })
);

// Get all navigation items (admin only)
navigationRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const navigation = await Navigation.find({}).sort({
        location: 1,
        updatedAt: -1,
      });

      res.json({
        success: true,
        data: navigation,
      });
    } catch (error) {
      console.error("Navigation list error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching navigation list",
      });
    }
  })
);

// Create navigation (admin only)
navigationRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const navigationData = {
        ...req.body,
        meta: {
          createdBy: req.user._id,
          updatedBy: req.user._id,
          version: 1,
        },
      };

      const navigation = new Navigation(navigationData);
      const savedNavigation = await navigation.save();

      res.status(201).json({
        success: true,
        data: savedNavigation,
        message: "Navigation created successfully",
      });
    } catch (error) {
      console.error("Navigation creation error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error creating navigation",
      });
    }
  })
);

// Update navigation (admin only)
navigationRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const updateData = {
        ...req.body,
        meta: {
          ...req.body.meta,
          updatedBy: req.user._id,
          version: (req.body.meta?.version || 1) + 1,
        },
      };

      const navigation = await Navigation.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!navigation) {
        return res.status(404).json({
          success: false,
          message: "Navigation not found",
        });
      }

      res.json({
        success: true,
        data: navigation,
        message: "Navigation updated successfully",
      });
    } catch (error) {
      console.error("Navigation update error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error updating navigation",
      });
    }
  })
);

// Delete navigation (admin only)
navigationRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const navigation = await Navigation.findByIdAndDelete(req.params.id);

      if (!navigation) {
        return res.status(404).json({
          success: false,
          message: "Navigation not found",
        });
      }

      res.json({
        success: true,
        message: "Navigation deleted successfully",
      });
    } catch (error) {
      console.error("Navigation deletion error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting navigation",
      });
    }
  })
);

// Get site settings (public endpoint for branding)
navigationRouter.get(
  "/settings/site",
  expressAsyncHandler(async (req, res) => {
    try {
      const settings = await SiteConfig.findOne().sort({ updatedAt: -1 });

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "Site settings not found",
        });
      }

      // Only return public settings
      const publicSettings = {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        logo: settings.logo,
        favicon: settings.favicon,
        socialMedia: settings.socialMedia,
        contactInfo: settings.contactInfo,
      };

      res.json({
        success: true,
        data: publicSettings,
      });
    } catch (error) {
      console.error("Site settings fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching site settings",
      });
    }
  })
);

export default navigationRouter;
