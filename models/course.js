const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        require: [true,'Please add the title']
    },
    description: {
        type: String,
        require: [true,'Please add the description']
    },
    weeks: {
        type: String,
        require: [true,'Please add the number of weeks']
    },
    tuition: {
        type: Number,
        require: [true,'Please add cost of the course']
    },
    minimumSkill: {
        type: String,
        require: [true,'Please add a minimum skill'],
        enum: ['beginner','intermediate','advance']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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

//static method to get avg of tutionfee
courseSchema.statics.getAverageCost = async function (bootcamId){

    const arr = await this.aggregate([
        {
        $match: {bootcamp: bootcamId} 
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {$avg: '$tuition'}
            }
        }
])
try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcamId,{
     averageCost: Math.ceil(arr[0].averageCost/10)*10   
    })
} catch (err) {
 console.error(err)   
}
}

//call getAverageCost after save
courseSchema.post('save',function() {
    this.constructor.getAverageCost(this.bootcamp)
})

//call getAverageCost before save
courseSchema.pre('remove',function() {
    this.constructor.getAverageCost(this.bootcamp)})


module.exports = mongoose.model('Course',courseSchema)