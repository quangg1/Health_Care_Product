const mongoose= require('mongoose');
const connectionDb=async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to DB ${mongoose.connection.host}`);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }

}
module.exports= connectionDb;