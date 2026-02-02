import mongoose from "mongoose";

const connectToDb = async () => {
    // Connect to MongoDB
    return mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/thoughtdrop", {
        maxPoolSize: 50,
        minPoolSize: 10,
        socketTimeoutMS: 30000
    })
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("MongoDB connection error:", err));
}

export { connectToDb };