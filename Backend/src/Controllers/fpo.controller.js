import { AsyncHandler } from '../Utils/AsyncHandler.js';
import { ApiError } from "../Utils/ApiError.js";
import { Fpo } from "../Models/fpo.model.js";
import { User } from "../Models/user.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import mongoose from 'mongoose';

// Create a new FPO
const createFpo = AsyncHandler(async (req, res) => {
  const { name, region, bankDetails } = req.body;

  // Validate required fields
  if (!name || !region || !bankDetails?.accountNo || !bankDetails?.ifsc) {
    throw new ApiError(400, "Name, region, and complete bank details are required");
  }

  // Only ADMIN can create FPOs
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can create FPOs");
  }

  // Check if FPO with same name and region already exists
  const existingFpo = await Fpo.findOne({
    name: name.trim(),
    region: region.trim()
  });

  if (existingFpo) {
    throw new ApiError(409, "FPO with this name already exists in the region");
  }

  // Validate IFSC format (basic validation)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(bankDetails.ifsc.toUpperCase())) {
    throw new ApiError(400, "Invalid IFSC code format");
  }

  const fpo = await Fpo.create({
    name: name.trim(),
    region: region.trim(),
    bankDetails: {
      accountNo: bankDetails.accountNo.trim(),
      ifsc: bankDetails.ifsc.toUpperCase().trim()
    },
    membersCount: 0
  });

  return res.status(201).json(
    new ApiResponse(201, fpo, "FPO created successfully")
  );
});

// Get all FPOs with pagination and filtering
const getAllFpos = AsyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    region, 
    search,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  // Build filter query
  const filter = {};
  
  if (region) {
    filter.region = { $regex: region, $options: 'i' };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { region: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const fpos = await Fpo.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Fpo.countDocuments(filter);

  // Get member counts for each FPO
  const fpoIds = fpos.map(fpo => fpo._id);
  const memberCounts = await User.aggregate([
    {
      $match: {
        fpoId: { $in: fpoIds },
        role: "FARMER",
        isActive: true
      }
    },
    {
      $group: {
        _id: "$fpoId",
        count: { $sum: 1 }
      }
    }
  ]);

  // Map member counts to FPOs
  const memberCountMap = {};
  memberCounts.forEach(item => {
    memberCountMap[item._id.toString()] = item.count;
  });

  // Update FPOs with current member counts
  const fposWithCounts = fpos.map(fpo => ({
    ...fpo,
    currentMembersCount: memberCountMap[fpo._id.toString()] || 0
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      fpos: fposWithCounts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        totalFpos: total
      }
    }, "FPOs retrieved successfully")
  );
});

// Get FPO by ID with detailed information
const getFpoById = AsyncHandler(async (req, res) => {
  const { fpoId } = req.params;

  if (!mongoose.isValidObjectId(fpoId)) {
    throw new ApiError(400, "Invalid FPO ID");
  }

  const fpo = await Fpo.findById(fpoId);

  if (!fpo) {
    throw new ApiError(404, "FPO not found");
  }

  // Get detailed member information
  const members = await User.find({
    fpoId: fpoId,
    role: "FARMER",
    isActive: true
  }).select('name email phone createdAt');

  // Get FPO statistics
  const stats = await User.aggregate([
    {
      $match: {
        fpoId: new mongoose.Types.ObjectId(fpoId),
        isActive: true
      }
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 }
      }
    }
  ]);

  // Get farm statistics if Farm model is available
  let farmStats = {};
  try {
    const { Farm } = await import('../Models/farm.model.js');
    const farmData = await Farm.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'farmerId',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $match: {
          'farmer.fpoId': new mongoose.Types.ObjectId(fpoId),
          'farmer.isActive': true
        }
      },
      {
        $group: {
          _id: null,
          totalFarms: { $sum: 1 },
          totalArea: { $sum: '$areaHectares' },
          avgArea: { $avg: '$areaHectares' }
        }
      }
    ]);

    farmStats = farmData[0] || { totalFarms: 0, totalArea: 0, avgArea: 0 };
  } catch (error) {
    // Farm model not available, skip farm stats
    farmStats = { totalFarms: 0, totalArea: 0, avgArea: 0 };
  }

  const roleStats = {};
  stats.forEach(stat => {
    roleStats[stat._id] = stat.count;
  });

  const fpoDetails = {
    ...fpo.toObject(),
    members,
    statistics: {
      totalMembers: members.length,
      roleBreakdown: roleStats,
      farmStatistics: farmStats
    }
  };

  return res.status(200).json(
    new ApiResponse(200, fpoDetails, "FPO details retrieved successfully")
  );
});

// Update FPO information
const updateFpo = AsyncHandler(async (req, res) => {
  const { fpoId } = req.params;
  const { name, region, bankDetails } = req.body;

  // Only ADMIN or FPO_ADMIN of this FPO can update
  if (req.user.role !== "ADMIN" && 
      (req.user.role !== "FPO_ADMIN" || req.user.fpoId?.toString() !== fpoId)) {
    throw new ApiError(403, "Not authorized to update this FPO");
  }

  if (!mongoose.isValidObjectId(fpoId)) {
    throw new ApiError(400, "Invalid FPO ID");
  }

  const fpo = await Fpo.findById(fpoId);
  if (!fpo) {
    throw new ApiError(404, "FPO not found");
  }

  // Build update object
  const updateData = {};
  
  if (name) {
    // Check if name already exists in the same region
    const existingFpo = await Fpo.findOne({
      _id: { $ne: fpoId },
      name: name.trim(),
      region: region || fpo.region
    });

    if (existingFpo) {
      throw new ApiError(409, "FPO with this name already exists in the region");
    }
    updateData.name = name.trim();
  }

  if (region) {
    updateData.region = region.trim();
  }

  if (bankDetails) {
    if (bankDetails.accountNo) {
      updateData['bankDetails.accountNo'] = bankDetails.accountNo.trim();
    }
    if (bankDetails.ifsc) {
      // Validate IFSC format
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(bankDetails.ifsc.toUpperCase())) {
        throw new ApiError(400, "Invalid IFSC code format");
      }
      updateData['bankDetails.ifsc'] = bankDetails.ifsc.toUpperCase().trim();
    }
  }

  const updatedFpo = await Fpo.findByIdAndUpdate(
    fpoId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedFpo, "FPO updated successfully")
  );
});

// Deactivate FPO (soft delete)
const deactivateFpo = AsyncHandler(async (req, res) => {
  const { fpoId } = req.params;

  // Only ADMIN can deactivate FPOs
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can deactivate FPOs");
  }

  if (!mongoose.isValidObjectId(fpoId)) {
    throw new ApiError(400, "Invalid FPO ID");
  }

  const fpo = await Fpo.findById(fpoId);
  if (!fpo) {
    throw new ApiError(404, "FPO not found");
  }

  // Check if FPO has active members
  const activeMembersCount = await User.countDocuments({
    fpoId: fpoId,
    isActive: true
  });

  if (activeMembersCount > 0) {
    throw new ApiError(400, `Cannot deactivate FPO with ${activeMembersCount} active members. Please transfer or deactivate members first.`);
  }

  // Add isActive field to FPO model for soft delete
  const updatedFpo = await Fpo.findByIdAndUpdate(
    fpoId,
    { $set: { isActive: false } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedFpo, "FPO deactivated successfully")
  );
});

// Get FPO dashboard statistics
const getFpoDashboard = AsyncHandler(async (req, res) => {
  const { fpoId } = req.params;

  // FPO_ADMIN can only access their own FPO dashboard
  if (req.user.role === "FPO_ADMIN" && req.user.fpoId?.toString() !== fpoId) {
    throw new ApiError(403, "Not authorized to access this FPO dashboard");
  }

  if (!mongoose.isValidObjectId(fpoId)) {
    throw new ApiError(400, "Invalid FPO ID");
  }

  const fpo = await Fpo.findById(fpoId);
  if (!fpo) {
    throw new ApiError(404, "FPO not found");
  }

  // Get comprehensive dashboard data
  const dashboardData = {};

  // Member statistics
  const memberStats = await User.aggregate([
    {
      $match: {
        fpoId: new mongoose.Types.ObjectId(fpoId),
        isActive: true
      }
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 }
      }
    }
  ]);

  dashboardData.memberStatistics = {
    total: memberStats.reduce((sum, stat) => sum + stat.count, 0),
    byRole: memberStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };

  // Try to get farm and carbon credit statistics
  try {
    const { Farm, CarbonCredit, Transaction } = await import('../Models/index.js');

    // Farm statistics
    const farmStats = await Farm.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'farmerId',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $match: {
          'farmer.fpoId': new mongoose.Types.ObjectId(fpoId),
          'farmer.isActive': true
        }
      },
      {
        $group: {
          _id: null,
          totalFarms: { $sum: 1 },
          totalArea: { $sum: '$areaHectares' },
          avgArea: { $avg: '$areaHectares' }
        }
      }
    ]);

    dashboardData.farmStatistics = farmStats[0] || { totalFarms: 0, totalArea: 0, avgArea: 0 };

    // Carbon credit statistics
    const creditStats = await CarbonCredit.aggregate([
      {
        $match: {
          fpoId: new mongoose.Types.ObjectId(fpoId)
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalCredits: { $sum: "$creditsIssued" }
        }
      }
    ]);

    dashboardData.carbonCreditStatistics = {
      byStatus: creditStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalCredits: stat.totalCredits
        };
        return acc;
      }, {}),
      totalCredits: creditStats.reduce((sum, stat) => sum + stat.totalCredits, 0)
    };

    // Revenue statistics
    const revenueStats = await Transaction.aggregate([
      {
        $lookup: {
          from: 'carbon_credits',
          localField: 'creditId',
          foreignField: '_id',
          as: 'credit'
        }
      },
      {
        $match: {
          'credit.fpoId': new mongoose.Types.ObjectId(fpoId),
          paymentStatus: 'SUCCESS'
        }
      },
      {
        $group: {
          _id: "$currency",
          totalRevenue: { $sum: "$netAmount" },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    dashboardData.revenueStatistics = revenueStats.reduce((acc, stat) => {
      acc[stat._id] = {
        totalRevenue: stat.totalRevenue,
        transactionCount: stat.transactionCount
      };
      return acc;
    }, {});

  } catch (error) {
    // Models not available, provide basic statistics
    dashboardData.farmStatistics = { totalFarms: 0, totalArea: 0, avgArea: 0 };
    dashboardData.carbonCreditStatistics = { byStatus: {}, totalCredits: 0 };
    dashboardData.revenueStatistics = {};
  }

  return res.status(200).json(
    new ApiResponse(200, {
      fpo,
      dashboard: dashboardData
    }, "FPO dashboard retrieved successfully")
  );
});

// Add member to FPO
const addMemberToFpo = AsyncHandler(async (req, res) => {
  const { fpoId } = req.params;
  const { userId } = req.body;

  // Only ADMIN or FPO_ADMIN of this FPO can add members
  if (req.user.role !== "ADMIN" && 
      (req.user.role !== "FPO_ADMIN" || req.user.fpoId?.toString() !== fpoId)) {
    throw new ApiError(403, "Not authorized to add members to this FPO");
  }

  if (!mongoose.isValidObjectId(fpoId) || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid FPO ID or User ID");
  }

  const fpo = await Fpo.findById(fpoId);
  if (!fpo) {
    throw new ApiError(404, "FPO not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.fpoId) {
    throw new ApiError(400, "User is already a member of an FPO");
  }

  // Update user's FPO
  await User.findByIdAndUpdate(userId, { fpoId: fpoId });

  // Update FPO member count
  const newMemberCount = await User.countDocuments({
    fpoId: fpoId,
    isActive: true
  });

  await Fpo.findByIdAndUpdate(fpoId, { membersCount: newMemberCount });

  return res.status(200).json(
    new ApiResponse(200, { userId, fpoId }, "Member added to FPO successfully")
  );
});

// Remove member from FPO
const removeMemberFromFpo = AsyncHandler(async (req, res) => {
  const { fpoId, userId } = req.params;

  // Only ADMIN or FPO_ADMIN of this FPO can remove members
  if (req.user.role !== "ADMIN" && 
      (req.user.role !== "FPO_ADMIN" || req.user.fpoId?.toString() !== fpoId)) {
    throw new ApiError(403, "Not authorized to remove members from this FPO");
  }

  if (!mongoose.isValidObjectId(fpoId) || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid FPO ID or User ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.fpoId?.toString() !== fpoId) {
    throw new ApiError(400, "User is not a member of this FPO");
  }

  // Remove user from FPO
  await User.findByIdAndUpdate(userId, { $unset: { fpoId: 1 } });

  // Update FPO member count
  const newMemberCount = await User.countDocuments({
    fpoId: fpoId,
    isActive: true
  });

  await Fpo.findByIdAndUpdate(fpoId, { membersCount: newMemberCount });

  return res.status(200).json(
    new ApiResponse(200, { userId, fpoId }, "Member removed from FPO successfully")
  );
});

export {
  createFpo,
  getAllFpos,
  getFpoById,
  updateFpo,
  deactivateFpo,
  getFpoDashboard,
  addMemberToFpo,
  removeMemberFromFpo
};