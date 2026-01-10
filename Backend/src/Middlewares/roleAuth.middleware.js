import { ApiError } from "../Utils/ApiError.js";
import { AsyncHandler } from "../Utils/AsyncHandler.js";


export const requireRole = (allowedRoles) => {
  return AsyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      throw new ApiError(403, `Access denied. Required role(s): ${roles.join(', ')}`);
    }

    next();
  });
};

export const requireAdmin = requireRole("ADMIN");

export const requireAdminOrFpoAdmin = requireRole(["ADMIN", "FPO_ADMIN"]);


export const requireFpoAccess = AsyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const userRole = req.user.role;
  const fpoId = req.params.fpoId;

  if (userRole === "ADMIN") {
    return next();
  }

  if (userRole === "FPO_ADMIN") {
    if (req.user.fpoId?.toString() === fpoId) {
      return next();
    } else {
      throw new ApiError(403, "Access denied. You can only access your own FPO data");
    }
  }

  throw new ApiError(403, "Access denied. Insufficient permissions");
});

export const requireMemberManagementAccess = AsyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const userRole = req.user.role;
  const fpoId = req.params.fpoId;

  if (userRole === "ADMIN") {
    return next();
  }

  if (userRole === "FPO_ADMIN" && req.user.fpoId?.toString() === fpoId) {
    return next();
  }

  throw new ApiError(403, "Access denied. You cannot manage members of this FPO");
});