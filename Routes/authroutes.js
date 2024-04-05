// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {isadmin} =require("../middlewares/authMiddleware")

// routing for register || post
router.post('/register', authController.registerController);

// routing for login || get
router.post('/login', authController.loginController);

router.post('/forgotpassword',authController.forgotPasswordEmail);

router.post('/verifyOTP',authController.verifyOTP);
router.post('/resetPassword',authController.resetPassword);

//test routes admin
router.post('/admin/login',isadmin,authController.loginController);


module.exports = router;