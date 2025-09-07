const Service = require("../models/service");
const Store = require("../models/store");
const { Exception, storeSuccess } = require("../utils/exceptionHandler");

class ServiceController {
  // Add a service to a store
  async addService(req, res) {
    try {
      const userId = req.user.id;
      const { storeId } = req.params;
      const { service_name, service_description, service_price } = req.body;

      if (!service_name || !service_description || !service_price) {
        return Exception(res, 400, "All fields are required");
      }

      const store = await Store.findOne({ _id: storeId, user: userId });
      if (!store) {
        return Exception(res, 404, "Store not found");
      }

      const newService = await Service.create({
        service_name,
        service_description,
        service_price,
        store: store._id,
      });

      store.services.push(newService._id);
      await store.save();

      return storeSuccess(res, 201, "Service added successfully", newService);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while adding service",
        err
      );
    }
  }

  // Get all services for a store
  async getServicesByStore(req, res) {
    try {
      const { storeId } = req.params;

      const services = await Service.find({ store: storeId });

      return storeSuccess(res, 200, "Services fetched successfully", services);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while fetching services",
        err
      );
    }
  }
}

module.exports = new ServiceController();
