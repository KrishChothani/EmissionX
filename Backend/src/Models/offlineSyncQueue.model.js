import mongoose, { Schema } from "mongoose";

const offlineSyncQueueSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: [
        "practice_log",
        "farm",
        "carbon_calculation",
        "carbon_credit",
        "transaction",
        "audit"
      ],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    operation: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
      comment: "Complete data payload for the operation"
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      comment: "Device identifier that created this sync item"
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      comment: "User who performed the offline operation"
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
      comment: "Sync priority (1 = highest, 10 = lowest)"
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    lastAttempt: {
      type: Date,
      default: null,
      index: true,
    },
    nextRetryAt: {
      type: Date,
      default: null,
      index: true,
    },
    errorMessage: {
      type: String,
      trim: true,
      default: null,
    },
    syncedAt: {
      type: Date,
      default: null,
      index: true,
    },
    conflictResolution: {
      strategy: {
        type: String,
        enum: ["SERVER_WINS", "CLIENT_WINS", "MERGE", "MANUAL"],
        default: "SERVER_WINS"
      },
      resolvedAt: {
        type: Date,
        default: null,
      },
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      }
    }
  },
  { 
    timestamps: true,
    collection: 'offline_sync_queue'
  }
);

// Compound indexes for efficient sync processing
offlineSyncQueueSchema.index({ status: 1, priority: 1, createdAt: 1 });
offlineSyncQueueSchema.index({ deviceId: 1, status: 1 });
offlineSyncQueueSchema.index({ userId: 1, status: 1 });
offlineSyncQueueSchema.index({ entityType: 1, entityId: 1, operation: 1 });
offlineSyncQueueSchema.index({ nextRetryAt: 1 }, { sparse: true });

// Method to increment retry count and set next retry time
offlineSyncQueueSchema.methods.incrementRetry = function() {
  this.retryCount += 1;
  this.lastAttempt = new Date();
  
  if (this.retryCount < this.maxRetries) {
    // Exponential backoff: 2^retryCount minutes
    const backoffMinutes = Math.pow(2, this.retryCount);
    this.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
    this.status = "PENDING";
  } else {
    this.status = "FAILED";
    this.nextRetryAt = null;
  }
  
  return this.save();
};

export const OfflineSyncQueue = mongoose.model("OfflineSyncQueue", offlineSyncQueueSchema);