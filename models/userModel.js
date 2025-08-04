const mongoose=require('mongoose');
const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:[true, 'User name is required'],
    },
    nickname: {
        type: String,
        default: ''
    },
    email:{
        type:String,
        required:[true, 'Email is required'],
        unique:true,
        match:[/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/,'Please fill a valid email address']
    },
    password:{
        type:String,
        required:[true, 'Password is required'],
        minlength:6
    },
    dob: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: ''
    },
    address:{
        type:Array,
        required:[true, 'Address is required']
    },
    defaultAddress: {
        type: String,
        default: ''
    },
    phone:{
        type:String,
        required:[true, 'Phone is required'],
        match: function() {
            // Only validate phone format if phone is provided
            return this.phone ? /^\d{10}$/ : true;
        }
    },
    paymentMethods: [{
        type: String,
        enum: ['cash', 'credit_card', 'momo', 'zalopay', 'shopeepay', 'banking', 'other'],
        default: 'cash'
    }],
    userType:{
        type:String,
        enum:['client', 'admin','pharmacist'],
        required:[true, 'User type is required'],
        default:'client'
    },
    profile:{
        type:String,
        default:'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg'
    },
    answer:{
        type:String,
        required:[true, 'Answer is required']
    },
    birthdate: {
        type: Date,
        default: null
    },
    profilePicture: {
        type: String,
        default: ''
    }
},{timestamps:true}
);
module.exports= mongoose.model('User',userSchema);