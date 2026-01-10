import mongoose, { Schema } from "mongoose";

const practiceLogSchema = new Schema(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    practiceId: {
      type: Schema.Types.ObjectId,
      ref: "Practice",
      required: true,
      index: true,
    },
    duration: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
        validate: {
          validator: function(endDate) {
            return endDate >= this.duration.start;
          },
          message: 'End date must be after start date'
        }
      }
    },
    inputs: {
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        required: true,
        trim: true,
      }
    },
    evidence: {
      photos: [{
        type: String,
        trim: true,
      }],
      satelliteRefs: [{
        type: String,
        trim: true,
      }]
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    offlineMeta: {
      createdOfflineAt: {
        type: Date,
        default: null,
      },
      deviceId: {
        type: String,
        trim: true,
        default: null,
      }
    },
    syncedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    }
  },
  { 
    timestamps: true,
    collection: 'practice_logs'
  }
);

// Compound indexes for efficient queries
practiceLogSchema.index({ farmId: 1, status: 1 });
practiceLogSchema.index({ practiceId: 1, createdAt: -1 });
practiceLogSchema.index({ "duration.start": 1, "duration.end": 1 });

export const PracticeLog = mongoose.model("PracticeLog", practiceLogSchema);