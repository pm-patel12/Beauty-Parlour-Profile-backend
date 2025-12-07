const Store = require("../models/store");
const Service = require("../models/service");
const Booking = require("../models/booking");
const User = require("../models/adminUser");

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
        capacity,
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
          capacity,
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

  // Toggle store active/inactive
  async toggleStoreStatus(req, res) {
    try {
      const { storeId } = req.params;
      const store = await Store.findById(storeId);

      if (!store) {
        return res.status(404).json({ success: false, msg: "Store not found" });
      }

      // flip the status
      store.is_active = !store.is_active;
      await store.save();

      res.status(200).json({
        success: true,
        msg: `Store is now ${store.is_active ? "active" : "inactive"}`,
        data: store,
      });
    } catch (error) {
      return Exception(res, 500, "Error updating store status", err);
    }
  }

  // Set all active
  async setAllActive(req, res) {
    try {
      const result = await Store.updateMany(
        { is_active: { $exists: false } },
        { $set: { is_active: true } }
      );
      return res.json({
        success: true,
        msg: "All stores updated to active",
        modified: result.modifiedCount,
      });
    } catch (err) {
      return Exception(res, 500, "Error updating stores", err);
    }
  }

  // Get all stores
  async getAllStores(req, res) {
    try {
      const stores = await Store.find().populate(
        "user",
        "-password -__v -createdAt -updatedAt"
      );

      if (!stores || stores.length === 0) {
        return Exception(res, 404, "No stores found");
      }

      return storeSuccess(res, 200, "All stores fetched successfully", stores);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while fetching stores",
        err
      );
    }
  }

  // Get active stores and total stores count
  async getStoreStats(req, res) {
    try {
      const totalStores = await Store.countDocuments();
      const activeStores = await Store.countDocuments({ is_active: true });

      return res.status(200).json({
        success: true,
        msg: "Store statistics fetched successfully",
        data: {
          totalStores,
          activeStores,
        },
      });
    } catch (err) {
      return Exception(res, 500, "Error fetching store statistics", err);
    }
  }

  // Delete store by Id
  async deleteStore(req, res) {
    try {
      const { storeId } = req.params;
      console.log(storeId, "storeId");
      if (!storeId) {
        return Exception(res, 400, "Store ID is required");
      }

      const store = await Store.findById(storeId);
      if (!store) {
        return Exception(res, 404, "Store not found");
      }

      const userId = store.user;
      // Delete all related services
      await Service.deleteMany({ store: storeId });

      // Delete all related bookings
      await Booking.deleteMany({ store: storeId });

      // Delete the store
      await Store.findByIdAndDelete(storeId);

      // Check if user has more stores
      const userStores = await Store.find({ user: userId });

      if (userStores.length === 0) {
        await User.findByIdAndDelete(userId);
        return res.status(200).json({
          success: true,
          msg: "Store deleted successfully",
        });
      }
    } catch (error) {
      return Exception(res, 500, "Error deleting store", error);
    }
  }
}

module.exports = new StoreController();
