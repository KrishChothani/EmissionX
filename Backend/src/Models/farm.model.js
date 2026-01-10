import mongoose, { Schema } from "mongoose";

const farmSchema = new Schema(
  {
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fpoId: {
      type: Schema.Types.ObjectId,
      ref: "Fpo",
      required: true,
      index: true,
    },
    areaHectares: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function(coords) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && // longitude
                   coords[1] >= -90 && coords[1] <= 90;     // latitude
          },
          message: 'Invalid coordinates format'
        }
      }
    },
    soilType: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { 
    timestamps: true,
    collection: 'farms'
  }
);

// Geospatial index for location-based queries
farmSchema.index({ location: "2dsphere" });

// Compound indexes for efficient queries
farmSchema.index({ farmerId: 1, fpoId: 1 });

export const Farm = mongoose.model("Farm", farmSchema);