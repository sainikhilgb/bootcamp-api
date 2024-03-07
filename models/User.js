const crypto = require('crypto')
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter the user name']
    },
    email:{
        type: String,
        required: [true, 'Please enter the email'],
        unique: true,
        match:[/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,'Please use valid email Id']
    },
    role:{
        type: String,
        enum: ['user','publisher'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, 'Please enter the password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type: Date,
        default: Date.now
    }
})

//Encrypt the password with bcrypt
UserSchema.pre('save',async function(next){

if(!this.isModified('password')){
    next()
}
    const salt = await bcryptjs.genSalt(10)
this.password = await bcryptjs.hash(this.password, salt)
})

//Sign in JWT token
UserSchema.methods.getSignedJwtToken= function (){
    return jwt.sign({id: this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    })
}

//Match the hashed password to user entered password
UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcryptjs.compare(enteredPassword, this.password)
}

//generate and hash password token
UserSchema.methods.getResetPasswordToken = function (){

    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex')

    //hash token and set to reset password
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //token expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
    
    return resetToken
}

module.exports = mongoose.model('User',UserSchema)