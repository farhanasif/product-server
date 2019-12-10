const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

const Category = require('../models/category');

router.get('/', (req, res, next) => {
    Category.find()
        .select('name description _id categoryImage gender')
        .exec()
        .then(docs => {
            //console.log(docs);
            const response = {
                count: docs.length,
                categories: docs.map(doc => {
                    return {
                        name: doc.name,
                        description: doc.description,
                        _id: doc._id,
                        gender: doc.gender,
                        categoryImage: 'http://localhost:4000/' + doc.categoryImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:4000/categories/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', checkAuth, upload.single('categoryImage'), (req, res, next) => {
    const category = new Category({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        gender: req.body.gender,
        categoryImage: req.file.path
    });

    category.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Category saved successfully',
                createdP: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });



});

router.get('/:categoryId', (req, res, next) => {
    const id = req.params.categoryId;
    Category.findById(id)
        .select('name description categoryImage gender _id')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json(doc);
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

router.patch('/:categoryId', checkAuth, (req, res, next) => {
    const id = req.params.categoryId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Category.update({ _id: id }, { $set: updateOps })
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


router.delete('/:categoryId', checkAuth, (req, res, next) => {
    const id = req.params.categoryId;
    Category.remove({
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