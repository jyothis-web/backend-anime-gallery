// app.js
const express = require("express");
require('dotenv').config();
const connectDB = require('./config/DBconnection');
const authRoute = require('./Routes/authroutes')
const categoryRoutes = require('./Routes/categoryRoutes')
const movieRoutes = require('./Routes/movieRoutes')
const cors = require('cors');
const morgan = require('morgan');
const path = require("path");



const app = express();
//middlewares
// app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
// app.use(bodyParser.json());


const PORT = process.env.PORT;




//routes
app.use("/auth", authRoute);
app.use("/admin", categoryRoutes);
app.use("/admin", movieRoutes);





app.listen(PORT, () => {
    console.log(`server started on port :${PORT}`);
});
//DBconnection
connectDB(); // Call the connectDB function
