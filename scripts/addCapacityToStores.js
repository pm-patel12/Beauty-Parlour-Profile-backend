const mongoose = require("mongoose");
require("dotenv").config();

const Store = require("../models/store");

// Default capacity value - you can change this if needed
const DEFAULT_CAPACITY = 10;

async function addCapacityToStores() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Find all stores that don't have a capacity field
    const storesWithoutCapacity = await Store.find({
      $or: [{ capacity: { $exists: false } }, { capacity: null }],
    });

    if (storesWithoutCapacity.length === 0) {
      await mongoose.connection.close();
      return;
    }

    // Update all stores without capacity
    await Store.updateMany(
      {
        $or: [{ capacity: { $exists: false } }, { capacity: null }],
      },
      {
        $set: { capacity: DEFAULT_CAPACITY },
      }
    );

    // Verify the update
    await Store.find({ capacity: DEFAULT_CAPACITY });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
addCapacityToStores();
