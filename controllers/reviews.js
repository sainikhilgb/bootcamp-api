const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Reviews = require('../models/reviews')
const Bootcamp = require('../models/Bootcamp')

//dec      GET reviews
//rout     GET api/v1/reviews
//rout     GET api/v1/bootcamps/:reviews
//access   Public
exports.getReviews = asyncHandler(async (req,res,next)=>{
    if(req.params.bootcampId){
       const reviews = await Reviews.find({bootcamp: req.params.bootcampId})

       return res.status(200).json({
         success: true,
         count: reviews.length,
         data: reviews
       })
    }else{
        res.status(200).json(res.advanceFiltering)
    }
   })

//dec      GET a single review
//rout     GET api/v1/review/:id
//access   Public
exports.getReview = asyncHandler(async (req,res,next)=>{
   const review = await Reviews.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
   })

   if(!review){
    return next(new ErrorResponse(`No review present with id ${req.params.id}`,404))
   }

   res.status(200).json({
    success: true,
    data: review
   })
   })

//dec      Add a review
//rout     POST api/v1/bootcamp/:bootcampId/reviews
//access   Private
exports.addReview = asyncHandler(async (req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    
    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`,404))
    }

    const review = await Reviews.create(req.body)
    
    res.status(201).json({
     success: true,
     data: review
    })
})

//dec      update a review
//rout     PUT api/v1/reviews/:id
//access   Private
exports.updateReview = asyncHandler(async (req,res,next)=>{
   
    
    let review = await Reviews.findById(req.params.id)
    
    if(!review){
        return next(new ErrorResponse(`No review with id ${req.params.id}`,404))
    }

    //make sure review belongs to user or user is admin
    if(review.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse('User is not authorized to update this review',401))
    }

    review = await Reviews.findByIdAndUpdate(req.params.id,req.body,{new :true, runValidators: true})
    
    res.status(200).json({
     success: true,
     data: review
    })
})


//dec      delete a review
//rout     DELETE api/v1/reviews/:id
//access   Private
exports.deleteReview = asyncHandler(async (req,res,next)=>{
   
    
    const review = await Reviews.findById(req.params.id)
    
    if(!review){
        return next(new ErrorResponse(`No review with id ${req.params.id}`,404))
    }

    //make sure review belongs to user or user is admin
    if(review.user.toString() !== req.user.id && req.user.role !=='admin'){
        return next(new ErrorResponse('User is not authorized to update this review',401))
    }

    await review.remove()
    
    res.status(200).json({
     success: true,
     data: 'Review deleted'
    })
})