const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const usermodel = require("../models/userModel");
const hashpassword = require("../helpers/authHelper");
const nodemailer = require("nodemailer");

// for register user
const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name) {
      return res.status(400).json({ mesage: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ mesage: "error: Email is required" });
    }
    if (!password) {
      return res.status(400).json({ mesage: "error: Password is required" });
    }

    // user checking
    const existingUser = await usermodel.findOne({ email });

    // existing user checking
    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "Already registered, please login",
      });
    }

    // register user
    const hashedPassword = await hashpassword(password);

    // save
    const user = new usermodel({ name, email, password: hashedPassword });
    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    // return console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in registration",
      error: error.message,
    });
  }
};

// for login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Find email
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

//to sent otp
const sendOTP = async (email, otp) => {
  try {
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      //service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Configure email options
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

//for forgot password through email
const forgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // Find email in user model
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    }

    // Generate OTP and current timestamp
    const otp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
    const timestamp = new Date();

    user.otp = { code: otp, timestamp };
    await user.save();

    // Send OTP to the user's email
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in sending OTP",
      error: error.message,
    });
  }
};

//to verify otp
const verifyOTP = async (req, res) => {
  try {
    const { email, userOTP } = req.body;
    console.log(userOTP);
    // Validation
    if (!email || !userOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided",
      });
    }

    // Find the user by email
    const user = await usermodel.findOne({ email });
    if (!user || !user.otp || user.otp === null) {
      return res.status(404).json({
        success: false,
        message: "No OTP found for this email",
      });
    }

    // Extract OTP and timestamp from the user document
    const { code: otp, timestamp } = user.otp;

    // Check if OTP is expired (more than 2 minutes old)
    const expirationTime = new Date(timestamp.getTime() + 5 * 60 * 1000); // Add 5 minutes to the timestamp
    if (new Date() > expirationTime) {
      // OTP has expired
      // Delete the expired OTP from the user document
      user.otp = undefined;
      await user.save();

      return res.status(401).json({
        success: false,
        message: "OTP has expired",
      });
    }
    console.log(otp);
    // Compare the provided OTP with the OTP stored in the database
    if (parseInt(userOTP, 10) === parseInt(otp, 10)) {
      user.otp = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } else {
      // If OTP does not match, return an error
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in OTP verification",
      error: error.message,
    });
  }
};

// Function to reset user's password
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!password) {
      // Handle case where password is not provided in request body
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }
    const hashedPassword = await hashpassword(password);

    // Update user's password in the database
    await usermodel.findOneAndUpdate(
      { email: email },
      { password: hashedPassword }
    );

    console.log("Password reset successful");
    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordEmail,
  verifyOTP,
  resetPassword,
};
