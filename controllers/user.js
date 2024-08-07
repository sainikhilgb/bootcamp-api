const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')


//dec      Get all users
//rout     GET api/v1/users
//access   Private/admin
exports.getUsers = asyncHandler(async (req,res,next)=>{
  res.status(200).json(res.advanceFiltering) 
  })

//dec      Get a single user
//rout     GET api/v1/users/:id
//access   Private/admin
exports.getUser = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.params.id) 
    res.status(200).json({
        success: true,
        data: user 
     }) 
})

//dec      Create a user
//rout     POST api/v1/users
//access   Private/admin
exports.createUser = asyncHandler(async (req,res,next)=>{
    const user = await User.create(req.body) 
    res.status(201).json({
        success: true,
        data: user 
    }) 
})


//dec      Update user
//rout     PUT api/v1/users/:id
//access   Private/admin
exports.updateUser = asyncHandler(async (req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators: true}) 
    res.status(200).json({
        success: true,
        data: user 
    }) 
})

//dec      Delete user
//rout     DELETE api/v1/users/:id
//access   Private/admin
exports.deleteUser = asyncHandler(async (req,res,next)=>{
    await User.findByIdAndDelete(req.params.id) 
    res.status(200).json({
        success: true,
        data: 'User has been deleted'
    }) 
})