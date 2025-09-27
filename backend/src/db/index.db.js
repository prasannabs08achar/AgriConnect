import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017";
        const connectedInstance = await mongoose.connect(`${mongoURI}/${DB_NAME}`);
        console.log(`DB connected to ${connectedInstance.connection.host}`);

    } catch (error) {
        console.error("ERR", error);
        throw error;
    }
}
export default connectDB;
