const sequelize = require('sequelize');

// connect to Postgres database
var sequelize = new Sequelize('WEB322', 'dantheoo12', 'wuekanlQt40V', {
    host: 'ep-wandering-mountain-36097825.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// initialize data models
const Post = sequelize.define('Post', {
    body: sequelize.TEXT,
    title: sequelize.STRING,
    postDate: sequelize.DATE,
    featureImage: sequelize.STRING,
    published: sequelize.BOOLEAN
})

const Category = sequelize.define('Category', {
    category: sequelize.STRING
})

Post.belongsTo(Category, {foreignKey: 'category'}); // define relationship

module.exports.initialize = () => {
    return new Promise(async function(resolve, reject) {
        reject();
    })
}


module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        reject();
    })
}

module.exports.getPublishedPosts = () => {
    return new Promise ((resolve, reject) => {
        reject();
    })
}

module.exports.getCategories = () => {
    return new Promise ((resolve, reject) => {
        reject();
    })
}

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        reject();
    })
}

module.exports.getPostsByCategory = (category) => {
    return new Promise ((resolve, reject) => {
        reject();
    })
}

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise ((resolve, reject) => {
        reject();
    })
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        reject();
    })
}

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise ((resolve, reject) => {
        reject();
    })
}