const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    business_name: {
      type: String,
      required: true,
      maxlength: 50,
    },
    business_tagline: {
      type: String,
      required: true,
      maxlength: 100,
    },
    address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      enum: ["India", "USA", "Canada"],
      required: true,
    },
    business_contact_number: {
      type: String,
      required: true,
    },
    business_email: {
      type: String,
    },
    starting_hour: {
      type: String,
      required: true,
    },
    ending_hour: {
      type: String,
      required: true,
    },
    working_days: {
      type: [String],
      required: true,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("stores", StoreSchema);
