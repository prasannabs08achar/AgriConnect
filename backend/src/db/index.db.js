import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectedInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`DB connected to ${connectedInstance.connection.host}`);

    } catch (error) {
        console.error("ERR", error);

    }
}
export default connectDB;
