import { AsyncHandler } from '../Utils/AsyncHandler.js';
import { ApiError } from "../Utils/ApiError.js";
import { FarmerReg } from "../Models/farmer.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import mongoose from 'mongoose';

// Create a new farmer registration
const createFarmer = AsyncHandler(async (req, res) => {
  const { fullname, location, area, crops, cycle, certification_statue } = req.body;

  // Validate required fields
  if (!fullname || !location || !area || !crops || !cycle || !certification_statue) {
    throw new ApiError(400, "All fields are required: fullname, location, area, crops, cycle, certification_statue");
  }

  // Trim and validate input data
  const farmerData = {
    fullname: fullname.trim(),
    location: location.trim(),
    area: area.trim(),
    crops: crops.trim(),
    cycle: cycle.trim(),
    certification_statue: certification_statue.trim()
  };

  // Check if farmer with same name and location already exists
  const existingFarmer = await FarmerReg.findOne({
    fullname: farmerData.fullname,
    location: farmerData.location
  });

  if (existingFarmer) {
    throw new ApiError(409, "Farmer with this name already exists in the same location");
  }

  // Create new farmer registration
  const farmer = await FarmerReg.create(farmerData);

  return res.status(201).json(
    new ApiResponse(201, farmer, "Farmer registered successfully")
  );
});

// Get farmer by ID
const getFarmerById = AsyncHandler(async (req, res) => {
  const { farmerId } = req.params;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(farmerId)) {
    throw new ApiError(400, "Invalid farmer ID");
  }

  // Find farmer by ID
  const farmer = await FarmerReg.findById(farmerId);

  if (!farmer) {
    throw new ApiError(404, "Farmer not found");
  }

  return res.status(200).json(
    new ApiResponse(200, farmer, "Farmer details retrieved successfully")
  );
});

// Get all farmers with pagination and filtering
const getAllFarmers = AsyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    location, 
    certification_statue,
    cycle,
    search,
    sortBy = 'fullname',
    sortOrder = 'asc'
  } = req.query;

  // Build filter query
  const filter = {};
  
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (certification_statue) {
    filter.certification_statue = { $regex: certification_statue, $options: 'i' };
  }

  if (cycle) {
    filter.cycle = { $regex: cycle, $options: 'i' };
  }

  if (search) {
    filter.$or = [
      { fullname: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { crops: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const farmers = await FarmerReg.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await FarmerReg.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      farmers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        totalFarmers: total
      }
    }, "Farmers retrieved successfully")
  );
});

export {
  createFarmer,
  getFarmerById,
  getAllFarmers
};