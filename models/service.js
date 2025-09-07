const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    service_name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    service_description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    service_price: {
      type: Number,
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stores",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
