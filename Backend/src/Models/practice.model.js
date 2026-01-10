import mongoose, { Schema } from "mongoose";

const practiceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    carbonFactor: {
      type: Number,
      required: true,
      min: 0,
      comment: "tCO2e per unit"
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: "hectare"
    },
    methodology: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "VERRA_VM0042",
        "VERRA_VM0017", 
        "GOLD_STANDARD",
        "CDM_AMS_III_AU",
        "CUSTOM"
      ],
      default: "VERRA_VM0042"
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { 
    timestamps: true,
    collection: 'practices'
  }
);

// Indexes for efficient queries
practiceSchema.index({ methodology: 1, isActive: 1 });

export const Practice = mongoose.model("Practice", practiceSchema);