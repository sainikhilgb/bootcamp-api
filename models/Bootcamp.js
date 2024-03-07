const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geoCoder')
const course = require('./course')

const BootCampSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Name filed is Mandatory'],
        unique: true,
        trim: true,
        maxlength: [50,'Name should not be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true,'Description filed is Mandatory'],
        maxlength: [500,'Description should not be more than 500 characters']
    },
    website:{
       type:String,
       match:[/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
       'Please use valid URL with HTTP or HTTPS']  
    },
    phoneNumber:{
        type: String,
        maxlength: [20,'Phone Number should not be more than 20 characters']
    },
    email:{
        type: String,
        match:[/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,'Please use valid email Id']
    },
    address:{
        type: String,
        required: [true,'Please enter valid address']
    },
    location: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          //required: true
        },
        coordinates: {
          type: [Number],
         // required: true,
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
      },
      careers:{
        //Array
        type: [String],
        required: true,
        enum:['Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'other']
      },
      averageRating:{
        type: Number,
        min: [1,'Rating should be atleast 1'],
        max: [10,'Maximum ating is 10']
      },
      averageCost: Number,
      photo:{
        type: String,
        default: 'no-photo.jpj'
      },
      housing:{
        type: Boolean,
        default: false
      },
      jobAssistance:{
        type: Boolean,
        default: false
      },
      jobGarentee:{
        type: Boolean,
        default: false
      },
      acceptGi:{
        type: Boolean,
        default: false
      },
      createdAt:{
        type: Date,
        default: Date.now
      },
      user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }

},
{
  toJSON:{ virtuals: true},
  toObject:{ virtuals: true},
}
)
BootCampSchema.pre('save',function(next){
this.slug = slugify(this.name,{lower:true})
next()
})

//Geocode creater & location field
BootCampSchema.pre('save', async function(next){
  const loc = await geocoder.geocode(this.address)
  this.location ={
    type: 'Point',
    coordinates: [loc[0].longitude,loc[0].latitude],
    formattedAddress:loc[0].formattedAddress,
    street:loc[0].streetName,
    city:loc[0].city,
    state:loc[0].stateCode,
    zipcode:loc[0].zipcode,
    country:loc[0].countryCode,
  }

//don't save the address in DB
this.address = undefined
  next()
})

//Reverse populate with virtuals
BootCampSchema.virtual('courses',{
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
})



module.exports = mongoose.model('Bootcamp',BootCampSchema)