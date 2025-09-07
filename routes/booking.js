const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/bookingController");

router.post("/:storeId", BookingController.createBooking);

router.get("/:storeId", BookingController.getBookingsByStore);

module.exports = router;
