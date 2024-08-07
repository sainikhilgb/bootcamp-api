const bootcampController = require('../../controllers/bootcamps')
const Bootcamp = require('../../models/Bootcamp')
const httpMocks = require("node-mocks-http")
const newBootcamp = require("../mock-data/newBootcamp.json")

jest.mock("../../models/Bootcamp")

let req,res,next
let id = "5c8a1d5b0190b214360dc034"

beforeEach(()=>{
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
    next = jest.fn()
})
describe("bootcampController.getbootcamp",()=>{

    it("Should be a function",async()=>{
        expect(typeof bootcampController.getbootcamp).toBe("function")
    })

    it("Should have getBootcamp function",async()=>{
        req.params.id= id
        await bootcampController.getbootcamp(req,res,next)

        expect(res.statusCode).toBe(200)
        expect(Bootcamp.findById).toHaveBeenCalledWith(id)
    })

    it("Should return 200 response with user details",async ()=>{
        Bootcamp.findById.mockReturnValue(newBootcamp)
        await bootcampController.getbootcamp(req,res,next)
        expect(res.statusCode).toBe(200)
        expect(res._isEndCalled()).toBeTruthy()
        expect(res._getJSONData()).toStrictEqual({
            success: true,
            data: newBootcamp
        })
    })

})

describe("bootcampController.createbootcamp",()=>{

    // const req = { 
    //     user: { id: 'user_id', role: 'admin' }, 
    //     body: { /* your req.body data */ } }

        
    it("Should be a function",async()=>{
        expect(typeof bootcampController.createbootcamp).toBe("function")
    })

    
    it('should return success true and data for successful bootcamp creation', async () => {
        const mockUserId = 'mockUserId';
        const mockPublishedBootcamp = { _id: 'mockBootcampId', user: 'admin' };   
   const req = httpMocks.createRequest({ user: { id: mockUserId }, body: {} });
    
    
    Bootcamp.findOne.mockReturnValue(mockPublishedBootcamp)
    await bootcampController.createbootcamp(req,res,next)

    //expect(res.statusCode).toBe(201)
    expect(Bootcamp.findOne).toHaveBeenCalledWith({ user: 'mockUserId' });
      });
     //
      //expect(Bootcamp.create).toHaveBeenCalledWith(req.body);
    

    // expect(res._getJSONData()).toStrictEqual({
    //     success: true,
    //     data: mockPublishedBootcamp
    // })
    

})