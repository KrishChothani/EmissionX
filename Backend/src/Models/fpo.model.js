import mongoose, { Schema } from "mongoose";

const fpoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    bankDetails: {
      accountNo: {
        type: String,
        required: true,
        trim: true,
      },
      ifsc: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      }
    },
    membersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    collection: 'fpos'
  }
);

// Index for efficient queries
fpoSchema.index({ name: 1, region: 1 });
fpoSchema.index({ isActive: 1 });

export const Fpo = mongoose.model("Fpo", fpoSchema);