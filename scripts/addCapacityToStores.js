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
    console.log("Connected to database");

    // Find all stores that don't have a capacity field
    const storesWithoutCapacity = await Store.find({
      $or: [
        { capacity: { $exists: false } },
        { capacity: null },
      ],
    });

    console.log(`Found ${storesWithoutCapacity.length} stores without capacity field`);

    if (storesWithoutCapacity.length === 0) {
      console.log("All stores already have capacity field. Nothing to update.");
      await mongoose.connection.close();
      return;
    }

    // Update all stores without capacity
    const result = await Store.updateMany(
      {
        $or: [
          { capacity: { $exists: false } },
          { capacity: null },
        ],
      },
      {
        $set: { capacity: DEFAULT_CAPACITY },
      }
    );

    console.log(`Successfully updated ${result.modifiedCount} stores with capacity: ${DEFAULT_CAPACITY}`);

    // Verify the update
    const updatedStores = await Store.find({ capacity: DEFAULT_CAPACITY });
    console.log(`Verified: ${updatedStores.length} stores now have capacity set to ${DEFAULT_CAPACITY}`);

    await mongoose.connection.close();
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
addCapacityToStores();

