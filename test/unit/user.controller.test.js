const userController = require('../../controllers/user')
const User = require('../../models/User')
const httpMocks = require("node-mocks-http")
const newUser = require("../mock-data/new-user.json")

jest.mock("../../models/User")

let req,res,next
let id = "5c8a1d5b0190b214360dc034"
beforeEach(()=>{
   
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
    next = jest.fn()
})
describe("userController.getUser",()=>{

    it("Should be a function",async()=>{
        expect(typeof userController.getUser).toBe("function")
    })

    it("Should have getUser function",async()=>{
        req.params.id= id
        await userController.getUser(req,res,next)

        expect(res.statusCode).toBe(200)
        expect(User.findById).toHaveBeenCalledWith(id)
    })

    it("Should return 200 response with user details",async ()=>{
        User.findById.mockReturnValue(newUser)
        await userController.getUser(req,res,next)
        expect(res.statusCode).toBe(200)
        expect(res._isEndCalled()).toBeTruthy()
        expect(res._getJSONData()).toStrictEqual({
            success: true,
            data: newUser
        })
    })

})

describe("userController.createUser",()=>{

    it("Should be a function",async()=>{
        expect(typeof userController.createUser).toBe("function")
    })

    it("Should have createUser function",async()=>{
        
        await userController.createUser(req,res,next)
        expect(User.create).toBeCalledWith({})
    })

    it("Should return 201 response with user details",async ()=>{
        
        await userController.createUser(req,res,next)
        expect(res.statusCode).toBe(201)
        expect(res._isEndCalled()).toBeTruthy()
        
    })
})

describe("userController.updateUser",()=>{

    it("Should be a function",async()=>{
        expect(typeof userController.updateUser).toBe("function")
    })

    it("Should have updateUser function",async()=>{
        
        await userController.createUser(req,res,next)
        expect(User.create).toBeCalledWith({})
    })

    it("Should return 201 response with user details",async ()=>{
        
        await userController.createUser(req,res,next)
        expect(res.statusCode).toBe(201)
        expect(res._isEndCalled()).toBeTruthy()  
    })

    it("Should be JSON format body in response",async()=>{

        User.create.mockReturnValue(newUser)
        await userController.createUser(req,res,next)
        expect(res._getJSONData()).toStrictEqual({
            success: true,
            data: newUser
        })
    })
})

describe("userController.updateUser",()=>{

    it("Should have function",()=>{
        expect(typeof userController.updateUser).toBe("function")
    })

    it("Should call updateUser function",async()=>{
       req.params.id = id
       req.body = newUser
       await userController.updateUser(req,res,next)
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(id,newUser,{new: true, runValidators: true})
    })

    it("Should send response with http status 200",async()=>{
        req.params.id =id
        req.body = newUser
        User.findByIdAndUpdate.mockReturnValue(newUser)
        await userController.updateUser(req,res,next)
        expect(res.statusCode).toBe(200)
        expect(res._isEndCalled()).toBeTruthy()
        expect(res._getJSONData()).toStrictEqual({
            success: true,
            data: newUser
        })
     })
})

describe("userController.deleteUser",()=>{

    it("Should have function",()=>{
        expect(typeof userController.deleteUser).toBe("function")
    })

    it("Should call deleteUser function",async()=>{
       req.params.id = id
       await userController.deleteUser(req,res,next)
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(id)
    })

    it("Should send response with http status 200",async()=>{
    
        User.findByIdAndDelete.mockReturnValue(newUser)
        await userController.deleteUser(req,res,next)
        expect(res.statusCode).toBe(200)
        expect(res._isEndCalled()).toBeTruthy()
     })

})
