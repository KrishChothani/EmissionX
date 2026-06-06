import { Router } from "express";
import {
  createFarmer,
  getFarmerById,
  getAllFarmers
} from "../Controllers/farmer.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Farmer registration routes
router.route("/").post(createFarmer);                    // POST /api/v1/farmers - Create farmer registration
router.route("/").get(getAllFarmers);                    // GET /api/v1/farmers - Get all farmers
router.route("/:farmerId").get(getFarmerById);           // GET /api/v1/farmers/:farmerId - Get farmer by ID

export default router;