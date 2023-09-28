/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Daniel Jung Student ID: 046435038 Date: September 28, 2023
*
*  Online (Cyclic) Link: https://smiling-moccasins-tick.cyclic.cloud
*
********************************************************************************/ 


const express = require('express');
const path = require("path");
const app = express();
const blog_service = require("./blog-service");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

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
    blog_service.getAllPosts().then((data) => {res.send(data)})
    .catch((err) => {return {message: err}});
})
app.get('/categories', (req, res) => {
    blog_service.getCategories().then((data) => {res.send(data)})
    .catch((err) => {return {message: err}});
})
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/error404.html"));
})

try{
    blog_service.initialize().then(() => {
        app.listen(HTTP_PORT, () => { console.log(`Express http server listening on port ${HTTP_PORT}`) });
    })
}
catch {
    throw new Error("Could not initialize data set");
}