const advanceFiltering = (model,populate)=> async (req,res,next)=>{

    let query

  //copy query
  let reqQuery = {...req.query}

  //fields to exclude
  const removeField = ['select','sort','page','limit']

  //Loop all the remove fields and delete from req Query
  removeField.forEach(param => delete reqQuery[param])
 
  //create query string
  let querStr = JSON.stringify(reqQuery)
 
  //creating &gt, $gte etc...
  querStr = querStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`)

  //finding resource
  query =  model.find(JSON.parse(querStr))
//.populate('courses')
  //select fields
  if(req.query.select){
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }
   
 //sort fields
 if(req.query.sort){
  const sortBy = req.query.sort.split(',').join(' ')
  query = query.select(sortBy)
}else{
  query = query.select('-createdAt')
}

//pagination & limiting
const page = parseInt(req.query.page, 10) || 1
const limit= parseInt(req.query.limit, 10) || 20
const startIndex = (page -1) * limit
const endIndex = page * limit
const total = await model.countDocuments()

query = query.skip(startIndex).limit(limit)

if(populate){
    query = query.populate(populate)
}

  //executing query
    const results = await query

    //pagination result
    const pagination={}

    if(endIndex < total){
      pagination.next = {
        page : page +1,
        limit
      }
    }
      
      if(startIndex > 0){
        pagination.prev = {
          page : page - 1,
          limit
        }
    }

    res.advanceFiltering = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next()

}

module.exports = advanceFiltering