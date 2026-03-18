import mongoose from "mongoose";

const navigationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },

    location: {
      type: String,
      enum: ["header", "footer", "sidebar", "mobile"],
      required: true,
      index: true,
    },

    items: [
      {
        label: { type: String, required: true, maxlength: 50 },
        url: { type: String, required: true },
        external: { type: Boolean, default: false },
        openNewTab: { type: Boolean, default: false },
        icon: { type: String },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },

        // Nested menu support
        children: [
          {
            label: { type: String, required: true, maxlength: 50 },
            url: { type: String, required: true },
            external: { type: Boolean, default: false },
            openNewTab: { type: Boolean, default: false },
            icon: { type: String },
            order: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
          },
        ],

        // Access control
        requiresAuth: { type: Boolean, default: false },
        allowedRoles: [{ type: String, enum: ["admin", "seller", "user"] }],
      },
    ],

    isActive: { type: Boolean, default: true },

    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      version: { type: Number, default: 1 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
navigationSchema.index({ location: 1, isActive: 1 });

const Navigation =
  mongoose.models.Navigation ||
  mongoose.model("Navigation", navigationSchema);

export { Navigation, navigationSchema };
export default Navigation;
