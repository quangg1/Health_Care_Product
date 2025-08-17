const userModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const getUserController= async (req,res)=>{
    try {
        const user=await userModel.findById({_id:req.user.id})
        //validate user
        if(!user){
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        //hide password
        user.password = undefined;  
        res.status(200).send({
            success: true,
            message: "User fetched successfully",
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message:"Eror in getting user",
            error: error.message
        })
    }

};
// RESET PASSWORD
const resetPasswordController = async (req, res) => {
    try {
        const { email,answer, newPassword } = req.body;
        if (!answer || !newPassword ||! email) {
            return res.status(400).send({
                success: false,
                message: "All fields are required"
            });
        }
        const user = await userModel.findOne({ email, answer });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found or answer is incorrect"
            });
        }
        var salt = bcryptjs.genSaltSync(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);
        user.password = hashedPassword; // Assuming password is hashed in the model
        await user.save();
        res.status(200).send({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in resetting password",
            error: error.message
        });
    }
};
const updatePasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).send({
                success: false,
                message: "All fields are required"
            });
        }
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        // Check if old password matches
        const isMatch = await bcryptjs.compare(oldPassword,user.password); // Assuming comparePassword is a method
        if (!isMatch) {
            return res.status(400).send({
                success: false,
                message: "Old password is incorrect"
            });
        }
        var salt=bcryptjs.genSaltSync(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);
        user.password = hashedPassword; // Assuming password is hashed in the model
        await user.save();
        res.status(200).send({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in updating password",
            error: error.message
        });
    }
};
const deleteAccountController = async (req, res) => {
  try {
    // Nếu xác thực bằng token, dùng id từ req.user
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).send({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting user",
      error: error.message
    });
  }
};
const updateUserController = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const updatedData = req.body;

    // Handle profile picture update
    // If a file is uploaded, construct the URL for it
    if (req.file) {
      updatedData.profile = `/uploads/${req.file.filename}`;
    }
    // If a profile URL is provided in the body and no file is uploaded, it's used directly
    // The validation in the route ensures it's a valid URL format

    if (updatedData.dob) {
      updatedData.dob = new Date(updatedData.dob);
    }

    // Find the user by ID and update their data
    const user = await userModel.findByIdAndUpdate(userId, updatedData, { new: true });

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hide the password from the returned user object
    user.password = undefined;

    // Return a success response with the updated user data
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    // Log any errors and return a 500 server error
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};
module.exports = {
  getUserController,
  resetPasswordController,
  updatePasswordController,
  deleteAccountController,
  updateUserController
};