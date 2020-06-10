const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const method = require('method-override');
const Picture = require("./model/Images")
require("dotenv/config")


const app =express()

mongoose.connect(process.env.Mongo,{
    useNewUrlParser:true,
    useUnifiedTopology:true
},()=> console.log('database created'))


app.set('views',path.join(__dirname,'views'))
app.set("view engine",'ejs')
app.use(method('_method'))


app.get('/upload',(req,res) =>{
    Picture.find({})
    .then(images =>{
        res.render('upload',{images : images})
       
    })
})


let storage = multer.diskStorage({
    destination:'./',
    filename:(req,file,cb) =>{
        cb(null,file.originalname)
    }
})


let upload = multer({

    storage:storage,
    fileFilter:(req,file,cb)=>{
        check(file,cb)
    }

}).single('single')


function check(file,cb){
    const filetype = /jpeg|pdf|img|png/
    const extname = filetype.test(path.extname(file.originalname).toLowerCase())
    if(extname){
        return cb(null,true)
    }else{
        cb('ERROR')
    }
}


app.get('/uploads',(req,res) =>{
    res.download('./Assignment1.pdf')
})


app.post('/uploadsingle',upload,(req,res,next) =>{
    const file = req.file
    if(!file){
        res.redirect('upload')
    }
  
    let url = file.path
    Picture.findOne({imgurl : url})
    .then(img =>{
        if(img){
            console.log('Exist')
            res.render('upload',{
                msg: 'File Exists !!!'
            })
        }else{
     
        Picture.create({imgurl:url})
        .then(img=>{

            if(req.file == undefined){
                res.render('upload', {
                  msg: 'Error: No File Selected!'
                });
              } else {
                res.redirect('/upload');
              }
        })
    }
    })
})




const port = 4000;

app.listen(port, () => console.log(`Server started on port ${port}`));