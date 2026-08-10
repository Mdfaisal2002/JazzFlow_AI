import mongoose from "mongoose";

const connectDB = async () => {

    try {

        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB connected");
        console.log("Host:", connection.connection.host);
        console.log("Database:", connection.connection.name);

    } catch (error) {

        console.log("MongoDB connection failed");
        console.log(error.message);

        process.exit(1);

    }

};

export default connectDB;