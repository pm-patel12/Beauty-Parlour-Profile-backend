const express = require("express");
const router = express.Router();
const StoreController = require("../controllers/storeController");
const authMiddleware = require("../authentication");

router.get("/allStores", authMiddleware, StoreController.getAllStores);

router.put("/", authMiddleware, StoreController.upsertStore);

router.get("/", authMiddleware, StoreController.getMyStore);

// Public: Get store by ID (no auth required)
router.get("/public/:storeId", StoreController.getStoreById);

// Update status
router.patch(
  "/:storeId/toggle-status",
  authMiddleware,
  StoreController.toggleStoreStatus
);

// Update all status
router.post("/set-all-active", authMiddleware, StoreController.setAllActive);

// Get active and total store count
router.get("/stats", authMiddleware, StoreController.getStoreStats);

// Delete a store (and cascade)
router.delete("/:storeId", authMiddleware, StoreController.deleteStore);

module.exports = router;
