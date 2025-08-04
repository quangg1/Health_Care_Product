const express = require('express');
const { getUserController,updateController,updatePasswordController,resetPasswordController
,deleteAccountController
 } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// GET USEr
router.get('/getUser',authMiddleware, getUserController );
// UPDATE USER
router.put('/updateUser', authMiddleware,updateController); 
router.post('/updatePassword',authMiddleware,updatePasswordController);
router.post('/resetPassword',authMiddleware,resetPasswordController);
router.delete('/deleteAccount/:id',authMiddleware,deleteAccountController);
module.exports=router;