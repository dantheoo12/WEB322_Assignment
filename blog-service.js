const fs = require('fs');

var posts = [];
var categories = [];

module.exports.initialize = () => {
    return new Promise(async function(resolve, reject) {
        try {
            await readPosts();
            await readCategories();
            resolve();
        }
        catch {
            reject("Error reading files");
        }
    })
}
function readPosts() {
    return new Promise ((resolve, reject) => {
        fs.readFile('data/posts.json', 'utf-8', (error, data) => {
            let postData = JSON.parse(data);
            posts = postData;
            resolve();
        })
    })
}
function readCategories() {
    return new Promise ((resolve, reject) => {
        fs.readFile('data/categories.json', 'utf-8', (error, data) => {
            let categoryData = JSON.parse(data);
            categories = categoryData;
            resolve();
        })
    })
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) {
            resolve(posts);
        }
        else {
            reject("No posts returned");
        }
    })
}

module.exports.getPublishedPosts = () => {
    return new Promise ((resolve, reject) => {
        let publishedPosts = posts.filter(post => post.published == true);
        if (publishedPosts.length > 0) {
            resolve(publishedPosts);
        }
        else {
            reject("No published posts returned");
        }
    })
}

module.exports.getCategories = () => {
    return new Promise ((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        }
        else {
            reject("No categories returned");
        }
    })
}