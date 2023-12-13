const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://mongodb:27017", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: "root",
            pass: "password",
            dbName: "videoUserDB",
        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("Database connection error", err);
        process.exit(1);
    }
};

module.exports = connectDB;