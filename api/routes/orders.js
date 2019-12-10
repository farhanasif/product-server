const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
var randomstring = require("randomstring");

const Order = require('../models/order');
const Product = require('../models/product');
const OrderDetail = require('../models/orderDetail');

router.get('/', checkAuth, (req, res, next) => {

    Order.aggregate([{
            $lookup: {
                from: "orderdetails", // collection name in db
                localField: "_id",
                foreignField: "order",
                as: "orderdetails"
            }
        }, {
            $lookup: {
                from: "users", // collection name in db
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        }])
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        amount: doc.amount,
                        shippingAddress: doc.shippingAddress,
                        city: doc.city,
                        state: doc.state,
                        zip: doc.zip,
                        country: doc.country,
                        payment: doc.payment,
                        tracking: doc.tracking,
                        status: doc.status,
                        _id: doc._id,
                        user: doc.user,
                        items: doc.orderdetails.length,
                        details: doc.orderdetails,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:4000/orders/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', checkAuth, (req, res, next) => {

    if (req.body.products.length > 1) {
        const tracking = randomstring.generate(18);

        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            user: req.body.user,
            amount: req.body.amount,
            shippingAddress: req.body.shippingAddress,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            country: req.body.country,
            payment: 1,
            tracking: tracking,
            status: 'SUBMITTED'
        });

        order.save()
            .then(result => {
                console.log(result._id);

                var orders = [];

                for (var i = 0; i < req.body.products.length; i++) {
                    //console.log(req.body.products[i]._id + ' - ' + req.body.products[i].quantity + ' - ' + result._id);
                    orders.push({
                        order: result._id,
                        product: req.body.products[i]._id,
                        quantity: req.body.products[i].quantity
                    })
                }
                console.log(orders);

                OrderDetail.insertMany(orders, (err, odetails) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    } else {
                        res.status(200).json({
                            message: 'request received',
                            result: result,
                            odetails: odetails
                        });
                    }
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.status(200).json({
            message: 'No Product submitted'
        });
    }
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "orderdetails", // collection name in db
                    localField: "_id",
                    foreignField: "order",
                    as: "orderdetails"
                }
            },
            {
                $lookup: {
                    from: "users", // collection name in db
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ])
        .exec()
        .then(docs => {
            const response = {
                orderdetails: docs.map(doc => {
                    return {
                        amount: doc.amount,
                        shippingAddress: doc.shippingAddress,
                        city: doc.city,
                        state: doc.state,
                        zip: doc.zip,
                        country: doc.country,
                        payment: doc.payment,
                        tracking: doc.tracking,
                        status: doc.status,
                        _id: doc._id,
                        user: doc.user,
                        items: doc.orderdetails.length,
                        details: doc.orderdetails,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:4000/orders/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Order.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({
                    message: 'No update found!'
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


router.delete('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({
            _id: id
        })
        .exec()
        .then(result => {
            console.log(result);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({
                    message: 'No entry found!'
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