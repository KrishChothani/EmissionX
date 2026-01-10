import { Router } from "express";
import {
  createFpo,
  getAllFpos,
  getFpoById,
  updateFpo,
  deactivateFpo,
  getFpoDashboard,
  addMemberToFpo,
  removeMemberFromFpo
} from "../Controllers/fpo.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { 
  requireAdmin, 
  requireFpoAccess, 
  requireMemberManagementAccess 
} from "../Middlewares/roleAuth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// FPO CRUD operations
router.route("/").post(requireAdmin, createFpo);                    // POST /api/v1/fpos - Create FPO (Admin only)
router.route("/").get(getAllFpos);                                  // GET /api/v1/fpos - Get all FPOs (All authenticated users)
router.route("/:fpoId").get(getFpoById);                           // GET /api/v1/fpos/:fpoId - Get FPO by ID (All authenticated users)
router.route("/:fpoId").patch(requireFpoAccess, updateFpo);        // PATCH /api/v1/fpos/:fpoId - Update FPO (Admin or FPO Admin)
router.route("/:fpoId/deactivate").patch(requireAdmin, deactivateFpo); // PATCH /api/v1/fpos/:fpoId/deactivate - Deactivate FPO (Admin only)

// FPO Dashboard and Analytics
router.route("/:fpoId/dashboard").get(requireFpoAccess, getFpoDashboard); // GET /api/v1/fpos/:fpoId/dashboard - Get FPO dashboard (Admin or FPO Admin)

// Member Management
router.route("/:fpoId/members").post(requireMemberManagementAccess, addMemberToFpo);    // POST /api/v1/fpos/:fpoId/members - Add member to FPO
router.route("/:fpoId/members/:userId").delete(requireMemberManagementAccess, removeMemberFromFpo); // DELETE /api/v1/fpos/:fpoId/members/:userId - Remove member from FPO

export default router;