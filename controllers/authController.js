const userModel = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const JWT= require('jsonwebtoken');

const registerControler= async (req,res) => {
    try {
        const {userName,email,password,phone,address,answer, nickname, dob, gender, defaultAddress, paymentMethods}= req.body;
        if (!userName || !email || !password || !phone|| !address || !answer) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        // checkuser
        const exisiting= await userModel.findOne({email:email});
        if (exisiting) {
            return res.status(500).json({
                success: false,
                message: 'User already exists'
            });
        }
        //hash password
        var salt=bcryptjs.genSaltSync(10);
        const hashedPassword= await bcryptjs.hash(password,salt);
        // create user
        const user= await userModel.create({
            userName,
            email,
            password : hashedPassword,
            phone,
            address,
            answer,
            nickname: nickname || '',
            dob: dob || null,
            gender: gender || '',
            defaultAddress: defaultAddress || '',
            paymentMethods: paymentMethods || []
        });
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error in registration',
            error: error.message
        });
    }
};

//LOGIN
const loginController=async (req,res) => {
    try {
        const {email,password}= req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        const user= await userModel.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // check user password | compare password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        //token
        const token=JWT.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        user.password = undefined; // remove password from response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error in login',
            error: error.message
    })
}
};

module.exports = {registerControler, loginController};