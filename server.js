/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Daniel Jung Student ID: 046435038 Date: October 10, 2023
*
*  Online (Cyclic) Link: https://smiling-moccasins-tick.cyclic.cloud
*
********************************************************************************/ 


const express = require('express');
const path = require("path");
const app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const blog_service = require("./blog-service");
const upload = multer();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dltw8gfwe',
    api_key: '667857881175663',
    api_secret: 'p2TmXRHXdPQd2WTiknOqdOL1y_o',
    secure: true
});


app.use(express.static("public"));
app.use(upload.single("featureImage"));


app.get('/', (req, res) => {
    res.redirect("/about")
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"))
})
app.get('/blog', (req, res) => {
    blog_service.getPublishedPosts().then((data) => {res.send(data)})
    .catch((err) => {return {message: err}});
})
app.get('/posts', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;
    if (category) {
        blog_service.getPostsByCategory(Number(category)).then((data) => res.send(data))
        .catch((err) => {return {message: err}});
    }
    else if (minDate) {
        blog_service.getPostsByMinDate(minDate).then((data) => res.send(data))
        .catch((err) => {return {message: err}});
    }
    else {
        blog_service.getAllPosts().then((data) => res.send(data))
        .catch((err) => {return {message: err}});
    }
})
app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"))
})
app.post('/posts/add', (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        return result;
    }
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        blog_service.addPost(req.body)
        .then(() => {
            console.log("New post added")
            res.redirect('/posts')}); // redirect to posts
})})
app.get('/posts/:value', (req, res) => {
    blog_service.getPostById(Number(req.params.value)).then((data) => res.send(data))
    .catch((err) => {return {message: err}});
})
app.get('/categories', (req, res) => {
    blog_service.getCategories().then((data) => {res.send(data)})
    .catch((err) => {return {message: err}});
})
app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
})
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/error404.html"));
})

// start server if initialize is successful
try{
    blog_service.initialize().then(() => {
        app.listen(HTTP_PORT, () => { console.log(`Express http server listening on port ${HTTP_PORT}`) });
    })
}
catch {
    throw new Error("Could not initialize data set");
}