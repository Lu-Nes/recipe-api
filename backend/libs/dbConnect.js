import mongoose from "mongoose";


mongoose.connection.on("error", error => {
    console.log("Datenbankfehler nach initialer Verbindung", error);
});

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.DATABASE });
        console.log("Verbunden mit MongoDB!");
    } catch (error) {
        console.error("Verbindungsfehler mit MongoDB!", error);
        process.exit(1);
    }
};

export default dbConnect;