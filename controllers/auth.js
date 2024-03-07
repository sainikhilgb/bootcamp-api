const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')



//dec   Register user
//rout   POST api/v1/auth/register
//access   Public
exports.register = asyncHandler(async (req,res,next)=>{
  
  const {name, email,password,role} = req.body

  //create user 
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  sendTokenResponse(user,200,res)
})


//dec   Login user
//rout  POST api/v1/auth/login
//access   Public
exports.login = asyncHandler(async (req,res,next)=>{
  
  const {email,password} = req.body

  //Validate email & password
  if(!email || !password ) {
    return next(new ErrorResponse('Please provide email & password', 400))
  }

  //check for user
  const user = await User.findOne({email}).select('+password')
  if(!user){
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  //check if password match 
  const isMatch = await user.matchPassword(password)

  if(!isMatch){
    return next(new ErrorResponse('Invalid credentials', 401))
  }


  sendTokenResponse(user,200,res)
})

//dec   Get current logged in user
//rout  GET api/v1/auth/me
//access   Private

exports.getMe = asyncHandler(async(req,res,next)=>{
  
const user = await User.findById(req.user.id)

res.status(200).json({
  success: true,
  data: user
})
})

//dec      log user out/clear cookoe
//rout     GET api/v1/auth/logout
//access   Private

exports.logout = asyncHandler(async(req,res,next)=>{
  
  res.cookie('token','none',{
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })  
  res.status(200).json({
    success: true,
    data: 'User loged out'
  })
  })

//dec   Update user details
//rout  PUT api/v1/auth/updateDetails
//access   Private

exports.updateDetails = asyncHandler(async(req,res,next)=>{
  
  const fieldsToUpdate = {name: req.body.name, email: req.body.email} 
  const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{new: true, runValidators: true})
  
  res.status(200).json({
    success: true,
    data: user
  })
  })

//dec   Update password
//rout  PUT api/v1/auth/updatePassword
//access   Private

exports.updatePassword = asyncHandler(async(req,res,next)=>{
  
  const user = await User.findById(req.user.id).select('+password')
  
  //check current password
  if(!(await user.matchPassword(req.body.currentPassword))){
    return next(new ErrorResponse('Incorect Password',401))
  }
  user.password = req.body.newPassword
  await user.save()

  sendTokenResponse(user,200,res)
  })


//dec   Forget Password
//rout  GET api/v1/auth/forgetPassword
//access   Public

exports.forgetPassword = asyncHandler(async(req,res,next)=>{
  const user = await User.findOne({email: req.body.email})

  if(!user){
    return next(new ErrorResponse('There is no user with email', 404))
  }

  //get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({validateBeforeSave: false})

  //create reset url
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`

  const message = `You are reciving this email because you or someone else has requested for reset password. 
  Please use PUT for this URL \n\n ${resetURL}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    })
   res.status(200).json({
      success: true,
      data: 'Email Sent'
    })      
  } catch (error) {
    console.log(error)
    user.resetPasswordToken=  undefined
    user.resetPasswordExpire= undefined

    await user.save({validateBeforeSave: false})

    return next(new ErrorResponse('Email could not sent',500))
  }

   res.status(200).json({
    success: true,
    data: user
  })
})


//dec   Reset Password
//rout  PUT api/v1/auth/resetPassword/:resetToken
//access   Public

exports.resetPassword = asyncHandler(async(req,res,next)=>{
  
  //get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })
if(!user){
  return next(new ErrorResponse('Invalid Token',400))
}
//set new password
user.password = req.body.password
user.resetPasswordToken = undefined
user.resetPasswordExpire = undefined

await user.save()

sendTokenResponse(user,200,res)
})


//get token from model, create cookie and send the response

const sendTokenResponse = (user,statusCode,res)=>{

  //create  token
  const token = user.getSignedJwtToken()

  const options={
    expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
     httpOnly: true 
  }

  if(process.env.NODE_ENV === 'production'){
    options.secure = true
  }

  res
  .status(statusCode)
  .cookie('token',token,options)
  .json(
    {
      success: true,
      token
    }
  )
}
  
