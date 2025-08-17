const express= require('express');

const app= express();
const cors= require('cors');
const morgan= require('morgan');
const dotenv= require('dotenv');
const connectionDb = require('./config/db');
// dot env cònig
dotenv.config({path: './.env'});
//connection
connectionDb();
//route 
//middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use('/api/v1/user',require('./routes/userRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/auth',require('./routes/authRoutes'));


const PORT= process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});