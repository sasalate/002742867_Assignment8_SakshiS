const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
    username:{
        type: String,
    },
    email:{
        type: String,
    },
    password:{
        type: String,
    }
},{
    versionKey: false // You should be aware of the outcome after set to false
})

const User = mongoose.model('User', userSchema);
module.exports = User;