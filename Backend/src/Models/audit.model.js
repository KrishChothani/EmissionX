import mongoose, { Schema } from "mongoose";

const auditSchema = new Schema(
  {
    creditId: {
      type: Schema.Types.ObjectId,
      ref: "CarbonCredit",
      required: true,
      index: true,
    },
    auditorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    auditType: {
      type: String,
      enum: ["FIELD", "SATELLITE", "DOCUMENT", "THIRD_PARTY"],
      required: true,
      index: true,
    },
    result: {
      type: String,
      enum: ["PASS", "FAIL", "CONDITIONAL_PASS"],
      required: true,
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      comment: "Audit score out of 100"
    },
    findings: [{
      category: {
        type: String,
        enum: ["DOCUMENTATION", "MEASUREMENT", "VERIFICATION", "COMPLIANCE", "OTHER"],
        required: true,
      },
      severity: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        required: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      recommendation: {
        type: String,
        trim: true,
      }
    }],
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    evidenceFiles: [{
      type: String,
      trim: true,
      comment: "URLs or file paths to audit evidence"
    }],
    auditedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    validUntil: {
      type: Date,
      comment: "Audit validity expiration date"
    },
    certificationBody: {
      name: {
        type: String,
        trim: true,
        comment: "Name of certification body if third-party audit"
      },
      accreditation: {
        type: String,
        trim: true,
        comment: "Accreditation details"
      }
    }
  },
  { 
    timestamps: true,
    collection: 'audits'
  }
);

// Compound indexes for efficient queries
auditSchema.index({ creditId: 1, auditType: 1 });
auditSchema.index({ auditorId: 1, result: 1 });
auditSchema.index({ auditedAt: -1 });
auditSchema.index({ validUntil: 1 });

export const Audit = mongoose.model("Audit", auditSchema);