const express = require("express");
const router = express.Router();
const ServiceController = require("../controllers/serviceController");
const authMiddleware = require("../authentication");

// Add a new service to a store
router.post("/:storeId", authMiddleware, ServiceController.addService);

// Get services by store
router.get("/:storeId", ServiceController.getServicesByStore);

module.exports = router;
