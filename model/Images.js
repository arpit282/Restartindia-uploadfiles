const mongoose = require('mongoose');

const  imageSchema = new mongoose.Schema({
    imgurl :{
        type:String,
        required:true
    }
})


module.exports = mongoose.model("Picture",imageSchema )
