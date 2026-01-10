import mongoose, { Schema } from "mongoose";

const carbonCalculationSchema = new Schema(
  {
    practiceLogId: {
      type: Schema.Types.ObjectId,
      ref: "PracticeLog",
      required: true,
      index: true,
    },
    methodology: {
      name: {
        type: String,
        required: true,
        trim: true,
        enum: [
          "VERRA_VM0042",
          "VERRA_VM0017", 
          "GOLD_STANDARD",
          "CDM_AMS_III_AU",
          "CUSTOM"
        ]
      },
      version: {
        type: String,
        required: true,
        trim: true,
        default: "1.0"
      }
    },
    baselineEmission: {
      type: Number,
      required: true,
      min: 0,
      comment: "tCO2e - baseline emissions without intervention"
    },
    reducedEmission: {
      type: Number,
      required: true,
      min: 0,
      comment: "tCO2e - emissions with sustainable practice"
    },
    netCarbon: {
      type: Number,
      required: true,
      comment: "tCO2e - net carbon sequestered/reduced (baselineEmission - reducedEmission)"
    },
    calculationDetails: {
      areaUsed: {
        type: Number,
        required: true,
        min: 0,
        comment: "hectares used in calculation"
      },
      durationDays: {
        type: Number,
        required: true,
        min: 0,
        comment: "practice duration in days"
      },
      carbonFactor: {
        type: Number,
        required: true,
        comment: "tCO2e per hectare factor used"
      }
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isLatest: {
      type: Boolean,
      default: true,
      comment: "Flag to identify the latest calculation for a practice log"
    }
  },
  { 
    timestamps: true,
    collection: 'carbon_calculations'
  }
);

// Ensure only one latest calculation per practice log
carbonCalculationSchema.index({ practiceLogId: 1, isLatest: 1 }, { unique: true, partialFilterExpression: { isLatest: true } });

// Index for methodology queries
carbonCalculationSchema.index({ "methodology.name": 1, "methodology.version": 1 });

// Pre-save middleware to ensure only one latest calculation
carbonCalculationSchema.pre('save', async function(next) {
  if (this.isNew && this.isLatest) {
    // Set all other calculations for this practice log to not latest
    await this.constructor.updateMany(
      { practiceLogId: this.practiceLogId, _id: { $ne: this._id } },
      { isLatest: false }
    );
  }
  next();
});

export const CarbonCalculation = mongoose.model("CarbonCalculation", carbonCalculationSchema);