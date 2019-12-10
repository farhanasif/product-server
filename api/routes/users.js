require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");

const checkAuth = require('../middleware/check-auth');
const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(result => {
            if (result.length >= 1) {
                return res.status(409).json({
                    message: 'User Already Exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const verificationCode = randomstring.generate();
                        const user = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            fullName: req.body.fullName,
                            role: req.body.role,
                            password: hash,
                            verified: req.body.verified,
                            verificationCode: verificationCode
                        });

                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    status: 200,
                                    message: 'user created'
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: 'An Error Occured',
                                    error: err
                                })
                            });
                    }

                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });


});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }

            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }

                if (result) {
                    const token = jwt.sign({
                        exp: Math.floor(Date.now().valueOf() / 1000) + (60 * 60 * 24),
                        email: user[0].email,
                        userId: user[0]._id
                    }, process.env.SECRET);
                    return res.status(200).json({
                        message: 'Auth Success',
                        token: token
                    })
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });

});

router.post('/userDetails', checkAuth, (req, res, next) => {
    console.log(req.userData);

    const email = req.userData.email;
    User.find({ email: email })
        .select('fullName email created_at _id')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    message: 'No user found!'
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});




module.exports = router;