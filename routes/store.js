const express = require("express");
const router = express.Router();
const StoreController = require("../controllers/StoreController");
const authMiddleware = require("../authentication");

router.put("/", authMiddleware, StoreController.upsertStore);

router.get("/", authMiddleware, StoreController.getMyStore);

// Public: Get store by ID (no auth required)
router.get("/public/:storeId", StoreController.getStoreById);


module.exports = router;
