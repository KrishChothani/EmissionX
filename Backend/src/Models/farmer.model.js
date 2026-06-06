import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    crops:{
        type: String,
        required: true,
        trim:true
    },
    cycle:{
        type: String,
        required: true,
        trim:true
    },
    certification_statue:{
        type: String,
        required: true,
        trim:true
    }
  },
  { 
    timestamps: true,
  }
);

export const FarmerReg = mongoose.model("FarmerReg", userSchema);
