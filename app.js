const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const method = require("method-override")
const fs = require('fs');
const Picture = require("./model/Images")

require("dotenv/config")

const app = express()

mongoose.connect(process.env.Mongo,
        {
           useNewUrlParser:true,
           useUnifiedTopology:true,
        },
        () => console.log("MongoDB connected sir")
)

// Model

app.set("views",path.join(__dirname,"views"))
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(method("_method"))



app.get("/upload",(req,res) =>{
    res.render("upload")
})

app.get("/uploads",(req,res) =>{
    res.redirect("/")
})

app.get("/",(req,res) =>{
    Picture.find({})
        .then(images =>{
            res.render("index",{images: images})
        })
})


let storage = multer.diskStorage({
    destination:"./public/uploads/images/",
    filename:(req,file,cb) =>{
        cb(null,file.originalname)
    }
})


let upload = multer({
    storage:storage,
    fileFilter: (req,file,cb) =>{
        chech(file,cb)
    }

}).single("single")



function chech(file,cb){
    const filetype = /jpeg|jpg|png|gif/
    const extname = filetype.test(path.extname(file.originalname).toLowerCase())

    if(extname){
        return cb(null,true)
    }else{
        cb("Error : Please images only")
    }

}

app.get("/uploadsingle",(req,res) =>{
    res.redirect("/upload")
})


app.post("/uploadsingle",upload,(req,res) =>{

     
    const file = req.file

    if(file == undefined){
        res.render('upload', {
            msg: "Please Upload the file !"
          });
    }else{

        let url = file.path.replace("public","")
        Picture.findOne({imgurl:url})
            .then(img =>{
                if(img){
                    res.render('upload', {
                        msg: "File Exist"
                    });
                }else{
                Picture.create({imgurl:url})
                .then(img =>{
                    if(img){
                        res.render("upload",{
                            msg:"File uploaded View it in gallery!"
                        })
                    }
                })
            }
            })
            .catch(err =>{
                console.log(err)
            })
    }
})

app.delete("/delete/:id",(req,res) =>{
    let search = {_id: req.params.id}
    Picture.findOne(search)
        .then(img =>{
            fs.unlink(__dirname+ "/public/"+img.imgurl,(err) =>{
                if(err){
                    return console.log(err)
                }
                Picture.deleteOne(search)
                    .then(img =>{
                        res.redirect("/")
                    })
            })
        }).catch(err =>{
            console.log(err)
        })
})



const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server started at port ${PORT}`))