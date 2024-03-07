const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        require: [true,'Please add the title of review'],
        maxlength: 100
    },
    text: {
        type: String,
        require: [true,'Please add the text'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        require: [true,'Please add the rating from 1 to 10']
    },
    createdAt:{
        type: Date,
        deafult: Date.now
    },
    bootcamp:{
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
})

//user can only submit 1 review for 1 bootcamp
reviewSchema.index({bootcamp:1, user:1},{unique: true})

//static method to get avg of rating and save
reviewSchema.statics.getAverageRating = async function (bootcamId){

    const arr = await this.aggregate([
        {
        $match: {bootcamp: bootcamId} 
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: {$avg: '$rating'}
            }
        }
])
try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcamId,{
        averageRating: arr[0].averageRating   
    })
} catch (err) {
 console.error(err)   
}
}

//call getAverageRating after save
reviewSchema.post('save',function() {
    this.constructor.getAverageRating(this.bootcamp)
})

//call getAverageRating before save
reviewSchema.pre('remove',function() {
    this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('Review',reviewSchema)