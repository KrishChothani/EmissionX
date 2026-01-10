import mongoose, { Schema } from "mongoose";

const carbonCreditSchema = new Schema(
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
    calculationId: {
      type: Schema.Types.ObjectId,
      ref: "CarbonCalculation",
      required: true,
      unique: true, // One credit per calculation
      index: true,
    },
    creditsIssued: {
      type: Number,
      required: true,
      min: 0,
      immutable: true, // Cannot be changed once set
      comment: "tCO2e credits issued - immutable once created"
    },
    vintageYear: {
      type: Number,
      required: true,
      min: 2020,
      max: 2050,
      index: true,
    },
    status: {
      type: String,
      enum: ["ISSUED", "SOLD", "RETIRED"],
      default: "ISSUED",
      index: true,
    },
    blockchain: {
      txHash: {
        type: String,
        trim: true,
        default: null,
        comment: "Blockchain transaction hash"
      },
      network: {
        type: String,
        enum: ["POLYGON", "ETHEREUM", "BINANCE", "SOLANA"],
        default: "POLYGON",
        comment: "Blockchain network used"
      },
      tokenId: {
        type: String,
        trim: true,
        default: null,
        comment: "NFT/Token ID on blockchain"
      }
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed once set
      index: true,
    },
    serialNumber: {
      type: String,
      unique: true,
      index: true,
      comment: "Unique serial number for the credit"
    }
  },
  { 
    timestamps: true,
    collection: 'carbon_credits'
  }
);

// Generate serial number before saving
carbonCreditSchema.pre('save', async function(next) {
  if (this.isNew && !this.serialNumber) {
    const year = this.vintageYear;
    const count = await this.constructor.countDocuments({ vintageYear: year });
    this.serialNumber = `CC-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Compound indexes for efficient queries
carbonCreditSchema.index({ farmerId: 1, status: 1 });
carbonCreditSchema.index({ fpoId: 1, vintageYear: 1 });
carbonCreditSchema.index({ vintageYear: 1, status: 1 });

export const CarbonCredit = mongoose.model("CarbonCredit", carbonCreditSchema);