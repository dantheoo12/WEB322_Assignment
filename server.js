/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Daniel Jung Student ID: 046435038 Date: November 15, 2023
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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

// set port
const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dltw8gfwe',
    api_key: '667857881175663',
    api_secret: 'p2TmXRHXdPQd2WTiknOqdOL1y_o',
    secure: true
});

// middleware
app.use(express.static("public"));
app.use(upload.single("featureImage"));
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});
app.use(express.urlencoded({extended: true}));


// add handlebars engines and helpers
app.engine('.hbs', exphbs.engine({
    extname:'.hbs', 
    helpers: {
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }   ,
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }}));
app.set('view engine', 'hbs');

// app routes
app.get('/', (req, res) => {
    res.redirect("/blog")
});

app.get('/about', (req, res) => {
    res.render('about');
})

app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blog_service.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get('/posts', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;
    if (category) {
        blog_service.getPostsByCategory(Number(category)).then((data) => {
            if (data.length > 0) res.render("posts", {posts: data});
            else res.render("posts", {message: "No post results"});
        })
        .catch((err) => res.render("posts", {message: err}));
    }
    else if (minDate) {
        blog_service.getPostsByMinDate(minDate).then((data) => {
            if (data.length > 0) res.render("posts", {posts: data});
            else res.render("posts", {message: "No post results"});
        })
        .catch((err) => res.render("posts", {message: err}));
    }
    else {
        blog_service.getAllPosts().then((data) => {
            if (data.length > 0) res.render("posts", {posts: data});
            else res.render("posts", {message: "No post results"});
        })
        .catch((err) => res.render("posts", {message: err}));
    }
})

app.get('/posts/add', (req, res) => {
    blog_service.getCategories()
    .then((data) => res.render('addPost', {categories: data}))
    .catch(() => res.render('addPost', {categories: []}));
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
    blog_service.getCategories().then((data) => {
        if (data.length > 0) res.render('categories', {categories:data});
        else res.render('categories', {message: 'No category results found'});
    })
    .catch((err) => res.render('categories', {message:err}));
})

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
})

app.post('/categories/add', (req, res) => {
    blog_service.addCategory(req.body)
    .then(() => {
        console.log("New category added")
        res.redirect('/categories')}); // redirect to posts
})

app.get('/categories/delete/:id', (req, res) => {
    blog_service.deleteCategoryById(req.params.id)
    .then(() => {
        res.redirect('/categories')
    })
    .catch(() => res.status(500, "Unable to Remove Category / Category not found"))
})

app.get('/posts/delete/:id', (req, res) => {
    blog_service.deletePostById(req.params.id)
    .then(() => {
        res.redirect('/posts')
    })
    .catch(() => res.status(500, "Unable to Remove post / Post not found"))
})

app.get('*', (req, res) => {
    res.render('error404');
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