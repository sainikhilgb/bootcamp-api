const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const geocoder = require('../utils/geoCoder')
const user = require('../models/User')


//dec   GET all bootcamps
//rout   GET api/v1/bootcamps
//access   Public
exports.getbootcamps = asyncHandler(async (req,res,next)=>{
  
  
    res.status(200).json(res.advanceFiltering)
})
//dec   GET single bootcamps
//rout   GET api/v1/bootcamps/:id
//access   Public
exports.getbootcamp = asyncHandler(async (req,res,next)=>{
        const bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp){
           return next(new ErrorResponse(`Bootcamp not found of id ${req.params.id}`,404))
        }
        res.status(200).json({
            sucess: true,
            data:  bootcamp
          })
       })

//dec   create new bootcamps
//rout   POST api/v1/bootcamps
//access   Private
exports.createbootcamp = asyncHandler(async (req,res,next)=>{  

  //Add user to req.body
  req.body.user = req.user.id

   //check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

  //if user is not admin they can only add one bootcamp
  if(publishedBootcamp && req.user.role !=='admin'){
    return next(new ErrorResponse(`The user Id ${req.user.id} has already published a bootcamp`,400))
  }
  
  const bootcamp = await Bootcamp.create(req.body)
  res.status(201).json({
    sucess: true,
    data:  bootcamp
  })
    
})

//dec   Update bootcamp
//rout   PUT api/v1/bootcamps/:id
//access   Private
exports.updatebootcamp = asyncHandler(async (req,res,next)=>{
        let bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp){
          return next(new ErrorResponse(`Bootcamp not found of id ${req.params.id}`,404))
        }

        //make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
          return next(new ErrorResponse(`User id ${req.params.id} is not authorized to update`,401))
        }

        bootcamp = await Bootcamp.findOneAndUpdate(req.param.id,req.body,{
          new: true, runValidators: true
        })
        res.status(200).json({
            sucess: true,
            data:  bootcamp
          })
})


//dec   Delete bootcamp
//rout   DELETE api/v1/bootcamps/:id
//access   Private
exports.deletebootcamp = asyncHandler(async(req,res,next)=>{
        const bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp){
          return next(new ErrorResponse(`Bootcamp not found of id ${req.params.id}`,404))
        }
         //make sure user is bootcamp owner
         if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
          return next(new ErrorResponse(`User id ${req.params.id} is not authorized to update`,401))
        }
        await bootcamp.deleteOne()
        res.status(200).json({
            sucess: true,
            data:  [`Bootcamp with ${req.params.id} is deleted`]
          })
})


//dec   Get bootcamps with in the radius
//rout   GET api/v1/bootcamps/radius/:zipcode/:distance
//access   Private
exports.getBootcampInRadius = asyncHandler(async(req,res,next)=>{
  const {zipcode, distance} = req.params

  //Get lan/log from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  //calculate radius using radius
  //Div dist by radius of earth
  //radius of earth 3,963 mil / 6,378 km

  const radius = distance/ 6378

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: {$centerSphere: [[lng,lat],radius]}}
  })

  res.status(200).json({
    sucess: true,
    count: bootcamps.length,
    data: bootcamps 
  })
})


//dec   Upload a photo
//rout   PUT api/v1/bootcamps/:id/photo
//access   Private
exports.bootcampPhotoUpload = asyncHandler(async(req,res,next)=>{
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

  if(!bootcamp){
    return next(new ErrorResponse(`Bootcamp not found of id ${req.params.id}`,404))
  }
   //make sure user is bootcamp owner
   if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User id ${req.params.id} is not authorized to update`,401))
  }
  if(!req.files){
    return next(new ErrorResponse('Please upload the file',400))
  }

const file = req.files.file

//making sure file is an image
  if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse('Please upload an image',400))
  }

  //Check the file size
  if(file.size > process.env.MAX_FILE_SIZE){
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_SIZE} `,400))
  }
file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
  if(err){
    console.log(err)
    return  next(new ErrorResponse('Problem with upload file',500))
  }

  await Bootcamp.findByIdAndUpdate(req.param.id,{photo: file.name})

  res.status(200).json({
    sucess: true,
    data: file.name 
  })
})
})