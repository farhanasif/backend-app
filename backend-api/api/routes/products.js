const express = require('express');
const router = express.Router();
const mysql = require('mysql');
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

// const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price weight cartDescription shortDescription longDescription productOffer stock productImage _id')
        .populate('category', 'name description gender')
        .exec()
        .then(docs => {
            //console.log(docs);
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        category: doc.category,
                        weight: doc.weight,
                        cartDescription: doc.cartDescription,
                        shortDescription: doc.shortDescription,
                        longDescription: doc.longDescription,
                        productOffer: doc.productOffer,
                        stock: doc.stock,
                        productImage: 'http://localhost:4000/' + doc.productImage,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:4000/products/' + doc._id
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

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        weight: req.body.weight,
        cartDescription: req.body.cartDescription,
        shortDescription: req.body.shortDescription,
        longDescription: req.body.longDescription,
        productOffer: req.body.productOffer,
        stock: req.body.stock,
        productImage: req.file.path,
        category: req.body.categoryId
    });

    product.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'It works on POST',
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

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price weight cartDescription shortDescription longDescription productOffer stock productImage _id')
        .populate('category', 'name description gender')
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

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
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


router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({
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