import mongoose from "mongoose";


const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.DATABASE });
        console.log("Verbunden mit MongoDB!");
    } catch (error) {
        console.error("Verbindungsfehler mit MongoDB!");
        process.exit(1);
    }
};


export default dbConnect;