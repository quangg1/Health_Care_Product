const express= require('express');

const app= express();
const cors= require('cors');
const morgan= require('morgan');
const dotenv= require('dotenv');
const connectionDb = require('./config/db');
const multer = require('multer');
const userController = require('./controllers/userController');
// dot env cònig
dotenv.config({path: './.env'});
//connection
connectionDb();
//route 
//middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/v1/user',require('./routes/userRoutes'));
app.use('/api/v1/drugs', require('./routes/drugRoutes'));
app.use('/api/v1/auth',require('./routes/authRoutes'));

const upload = multer({ dest: 'uploads/' });
app.post('/api/user/update-profile', upload.single('profilePicture'), userController.updateProfile);

const PORT= process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});