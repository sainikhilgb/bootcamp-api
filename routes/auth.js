const express = require('express')
const {register,login, 
    getMe,forgetPassword,
    resetPassword,updateDetails,
    updatePassword,logout} = require('../controllers/auth')
const {protect} = require('../middleware/auth')
const router = express.Router()

router.post('/register',register)
router.post('/login',login)
router.get('/logout',logout)
router.get('/me',protect,getMe)
router.put('/updateDetails',protect,updateDetails)
router.put('/updatePassword',protect,updatePassword)
router.post('/forgetPassword',forgetPassword)
router.put('/resetPassword/:resetToken',resetPassword)


module.exports = router