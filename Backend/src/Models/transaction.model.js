import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    creditId: {
      type: Schema.Types.ObjectId,
      ref: "CarbonCredit",
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      comment: "Transaction amount in specified currency"
    },
    currency: {
      type: String,
      required: true,
      enum: ["INR", "USD", "EUR"],
      default: "INR",
      uppercase: true,
    },
    creditsQuantity: {
      type: Number,
      required: true,
      min: 0,
      comment: "Number of carbon credits being transacted"
    },
    pricePerCredit: {
      type: Number,
      required: true,
      min: 0,
      comment: "Price per credit in specified currency"
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    paymentGateway: {
      provider: {
        type: String,
        enum: ["RAZORPAY", "STRIPE", "PAYPAL", "BANK_TRANSFER"],
        required: true,
      },
      gatewayRef: {
        type: String,
        trim: true,
        comment: "Payment gateway reference/transaction ID"
      },
      gatewayResponse: {
        type: Schema.Types.Mixed,
        default: {},
        comment: "Raw response from payment gateway"
      }
    },
    paidAt: {
      type: Date,
      default: null,
      index: true,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    transactionFee: {
      type: Number,
      default: 0,
      min: 0,
      comment: "Platform transaction fee"
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
      comment: "Net amount after deducting fees"
    }
  },
  { 
    timestamps: true,
    collection: 'transactions'
  }
);

// Pre-save middleware to calculate net amount
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('transactionFee')) {
    this.netAmount = this.amount - this.transactionFee;
  }
  next();
});

// Compound indexes for efficient queries
transactionSchema.index({ buyerId: 1, paymentStatus: 1 });
transactionSchema.index({ sellerId: 1, paymentStatus: 1 });
transactionSchema.index({ creditId: 1, paymentStatus: 1 });
transactionSchema.index({ paidAt: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);