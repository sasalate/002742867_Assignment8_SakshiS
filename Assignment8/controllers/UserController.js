const { response } = require('express');
const User = require('../models/User');
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const { validateEmail, checkPassword } = require("../validations");
const saltRounds = 10;


//Store users info 

const store = async (req, res, next) => {
    let requiredUser = User.findOne({ email: req.body.email });
    console.log(req.body.email)
    let passBool, emailBool = false;
    console.log(req.body);
    if (requiredUser) {
        res.status(400).send({ message: "Email Address already exists." });
    } else {

        if (validateEmail(req.body.email)) {
            // console.log("Proper email address");
            emailBool = true;
        } else {
            emailBool = false;
            res.status(400).send({ message: "Please input email address correctly!" });
        }

        if (checkPassword(req.body.password) && (req.body.password == req.body.confirm_password)) {
            passBool = true;
            // console.log("Password is correct");
        } else {
            passBool = false;
            res.status(400).send({ message: "Please input password correctly!" });
        }

        if (passBool && emailBool) {
            const hashedPassword = bcrypt.hash(req.body.password, saltRounds);
            let user = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            })
            user.save()
                .then(response => {
                    res.json({
                        message: 'User Added Successfully!'
                    })
                })
                .catch(error => {
                    res.json({
                        message: 'An error Occured'
                    })
                })
        }
    }
}

//Show user info
const show = (req, res, next) => {
    User.find()
        .then(response => {
            res.json({
                response
            })
        })
        .catch(error => {
            res.json({
                message: "An error Occured while displaying users"
            })
        })
}

//update user info
const update = async (req, res, next) => {
    // let userID = req.body.userID
    // console.log(userID)

    // let updatedData = {
    //     username: req.body.username,
    //     password: req.body.password
    // }

    // User.findByIdAndUpdate(userID, { $set: updatedData })
    //     .then(() => {
    //         res.json({
    //             message: "User data Updated successfully!"
    //         })
    //     })
    //     .catch(error => {
    //         res.json({
    //             message: "An error occured while updating user data"
    //         })
    //     })

    const user = await User.findOne({ email: req.body.email });
    console.log(user);

    if (user) {
      const passCompare = await bcrypt.compare(req.body.password, user.password);
      console.log(req.body.new_username)
      if (passCompare) {

        if (req.body.new_email != undefined && req.body.new_password != undefined && req.body.new_username != undefined) {
          res.status(400).send({ message: "Please provide either new username or new password parameters only!" });
        }
        else if (req.body.new_email != undefined && req.body.new_password == undefined) {
          res.status(404).send({
            message: "User email can't be updated"
          });
        }
        else if (req.body.new_email == undefined && req.body.new_password != undefined) {
          if (checkPassword(req.body.new_password)) {
            const newPassword = await bcrypt.hash(req.body.new_password, saltRounds);
            User.findByIdAndUpdate(user._id, { password: newPassword }, { useFindAndModify: false })
              .then(data => {
                if (!data) {
                  res.status(404).send({
                    message: `Cannot update password with user id=${user._id}. User was not found!`
                  });
                } else res.send({ message: "User password updated successfully!" });
              })
              .catch(err => {
                res.status(500).send({
                  message: "Error updating User's password with id=" + user._id
                });
              });
          } else {
            res.status(400).send({ message: "Please enter new password correctly!" });
          }
        } else if (req.body.new_password == undefined && req.body.new_username != undefined) {
          const newUsername = req.body.new_username
          User.findByIdAndUpdate(user._id, { username: newUsername }, { useFindAndModify: false })
            .then(data => {
              if (!data) {
                res.status(404).send({
                  message: `Cannot update username with user id=${user._id}. User was not found!`
                });
              } else res.send({ message: "Username was updated successfully." });
            })
        }
        else {
          res.status(400).send({ message: "Please provide either the new username or new password!" });
        }
      } else {
        res.status(404).send({
          message: `Wrong Password. Please enter correct password`
        });
      }
    } else {
      res.status(404).send({
        message: `User was not found! Please check the email address.`
      });
    }



}

const deleteUser = (req, res, next) => {
    let userEmail = req.body.userEmail
    User.findByIdAndRemove(userEmail)
        .then(() => {
            res.json({
                message: 'User deleted successfully!'
            })
        })
        .catch(error => {
            res.json({
                message: 'An error occured while deleting user'
            })
        })
}

module.exports = {
    show, update, deleteUser, store
}