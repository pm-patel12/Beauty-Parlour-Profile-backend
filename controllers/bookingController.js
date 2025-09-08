const Booking = require("../models/booking");
const Store = require("../models/store");
const { Exception, storeSuccess } = require("../utils/exceptionHandler");

class BookingController {
  async createBooking(req, res) {
    try {
      const { storeId } = req.params;
      const { name, phoneNumber, email, date, startTime, endTime } = req.body;

      if (!name || !phoneNumber || !date || !startTime || !endTime) {
        return Exception(res, 400, "All required fields must be provided");
      }

      // Check store exists
      const store = await Store.findById(storeId);
      if (!store) return Exception(res, 404, "Store not found");

      // Create booking
      const booking = await Booking.create({
        store: store._id,
        name,
        phoneNumber,
        email,
        date,
        startTime,
        endTime,
      });

      // Add booking ID to store's bookings array (optional)
      store.bookings = store.bookings || [];
      store.bookings.push(booking._id);
      await store.save();

      return storeSuccess(res, 201, "Booking created successfully", booking);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while creating booking",
        err
      );
    }
  }

  // Get bookings for a store (optional)
  async getBookingsByStore(req, res) {
    try {
      const { storeId } = req.params;
      const store = await Store.findById(storeId);
      if (!store) {
        return Exception(res, 404, "Store not found");
      }

      const bookings = await Booking.find({ store: storeId });

      if (!bookings || bookings.length === 0) {
        return storeSuccess(res, 200, "No bookings found", []);
      }

      return storeSuccess(res, 200, "Bookings fetched successfully", bookings);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while fetching bookings",
        err
      );
    }
  }
}

module.exports = new BookingController();
