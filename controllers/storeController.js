const Store = require("../models/store");
const {
  Exception,
  successDetails,
  storeSuccess,
} = require("../utils/exceptionHandler");

class StoreController {
  async upsertStore(req, res) {
    try {
      const userId = req.user.id;
      const {
        business_name,
        business_tagline,
        address,
        country,
        business_contact_number,
        business_email,
        starting_hour,
        ending_hour,
        working_days,
      } = req.body;

      if (
        !business_name ||
        !business_tagline ||
        !address ||
        !country ||
        !business_contact_number ||
        !starting_hour ||
        !ending_hour ||
        !working_days
      ) {
        return Exception(res, 400, "All required fields must be provided");
      }

      const store = await Store.findOneAndUpdate(
        { user: userId },
        {
          business_name,
          business_tagline,
          address,
          country,
          business_contact_number,
          business_email,
          starting_hour,
          ending_hour,
          working_days,
        },
        { new: true, upsert: true }
      );

      return storeSuccess(res, 200, "Store profile saved successfully", store);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while saving store",
        err
      );
    }
  }

  // Get Store by User
  async getMyStore(req, res) {
    try {
      const userId = req.user.id;
      const store = await Store.findOne({ user: userId });

      if (!store) {
        return Exception(res, 404, "No store found for this user");
      }

      return storeSuccess(res, 200, "Store fetched successfully", store);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while fetching store",
        err
      );
    }
  }

  // Get Store by ID (public)
  async getStoreById(req, res) {
    try {
      const { storeId } = req.params;

      if (!require("mongoose").Types.ObjectId.isValid(storeId)) {
        return Exception(res, 400, "Invalid store ID format");
      }
      const store = await Store.findById(storeId).populate("services");

      if (!store) {
        return Exception(res, 404, "No store found with this ID");
      }

      return storeSuccess(res, 200, "Store fetched successfully", store);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while fetching store by ID",
        err
      );
    }
  }
}

module.exports = new StoreController();
