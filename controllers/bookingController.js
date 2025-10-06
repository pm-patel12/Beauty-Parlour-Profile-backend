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

      const [day, month, year] = date.split("/").map(Number);
      const parsedDate = new Date(Date.UTC(year, month - 1, day));

      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayOfWeek = daysOfWeek[parsedDate.getUTCDay()];

      const workingDays = store.working_days?.map((d) => d.toLowerCase()) || [];
      if (!workingDays.includes(dayOfWeek)) {
        return Exception(
          res,
          400,
          `Store is closed on ${dayOfWeek}. Working days are: ${workingDays.join(
            ", "
          )}`
        );
      }

      // 5️⃣ Validate time range
      const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      const storeStart = toMinutes(store.starting_hour);
      const storeEnd = toMinutes(store.ending_hour);
      const bookingStart = toMinutes(startTime);
      const bookingEnd = toMinutes(endTime);

      if (
        bookingStart < storeStart ||
        bookingEnd > storeEnd ||
        bookingEnd <= bookingStart
      ) {
        return Exception(
          res,
          400,
          `Booking must be within working hours (${store.starting_hour} - ${store.ending_hour})`
        );
      }

      const existingBookings = await Booking.find({
        _id: { $in: store.bookings },
      });
      console.log(existingBookings, "existingBookings");
      const hasConflict = existingBookings.some((b) => {
        if (b.date !== date) return false;
        const existingStart = toMinutes(b.startTime);
        const existingEnd = toMinutes(b.endTime);
        return bookingStart < existingEnd && bookingEnd > existingStart;
      });

      if (hasConflict) {
        return Exception(
          res,
          400,
          `Another booking already exists between this time on ${date}`
        );
      }

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
