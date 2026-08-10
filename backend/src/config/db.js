import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");
        console.log("Host:", connection.connection.host);
        console.log("Database:", connection.connection.name);

    } catch (error) {
        console.log("MongoDB connection failed");
        console.log(error.message);

        throw error;
    }
};

export default connectDB;