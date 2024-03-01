const mongoose = require("mongoose");

const AnimecategorySchema = new mongoose.Schema({
    name :{
        type:String,
        required:true,   
    },

})
const categoryModel = mongoose.model('categories',AnimecategorySchema);

module.exports = categoryModel;