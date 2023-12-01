const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
    },
    password: String,
    email: String,
    loginHistory: [{ 
        dateTime: Date, 
        userAgent: String }]
})

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dantheoo12:5X6B5aKuPDeTE16V@seneca.w0ttvh0.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        let newUser = new User(userData);
        newUser.save().then(() => {
            resolve();
        })
        .catch((err) => {
            if (err.code == 11000) {
                reject( "Username already taken");
            }
            else {
                reject(`There was an error creating the user: ${err}`);
            }
        })
    })
}

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName}).exec()
        .then((foundUsers) => {
            if (foundUsers.length == 0) { // no users found
                reject(`Unable to find user: ${userData.userName}`);
            }
            else if (foundUsers[0].password != userData.password) { // user found but incorrect password
                reject(`Incorrect Password for user: ${userData.userName}`);
            }
            else { // user found and password is correct
                foundUsers[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.updateOne( // update user's login history
                    {userName: foundUsers[0].userName},
                    {$set: {loginHistory: foundUsers[0].loginHistory}}
                ).exec()    
                .then(() => { 
                    resolve(foundUsers[0]);
                })
                .catch((err) => {
                    reject(`There was an error verifying the user: ${err}`);
                })
            }
        })
        .catch((err) => {
            reject(`Unable to find user: ${userData.userName}`);
        })
    })
}