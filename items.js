const User = require('../models/user');
const Item = require('../models/item');
const Eval = require('../models/eval');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const multer = require('multer');
const upload = multer({ dest: './Client/src/assets/uploads/images/' });
const fs = require('fs');

module.exports = (router) => {

    router.post('/newItem', upload.any(), (req, res) => {

        if (!req.body.title) {
            res.json({
                success: false,
                message: 'Item title is required'
            });
        } else {
            if (!req.body.description) {
                res.json({
                    success: false,
                    message: 'description is required'
                });
            } else {
                if (!req.body.category) {
                    res.json({
                        success: false,
                        message: 'category is required'
                    });
                } else {
                    if (!req.body.createdBy) {
                        res.json({
                            success: false,
                            message: 'Creator is required'
                        });
                    } else {
                        let filename = (new Date).valueOf() + "-" + req.body.image.filename;
                        fs.writeFile("./Client/src/assets/uploads/images/" + filename, req.body.image.value, 'base64', function (err) {
                            const item = new Item({
                                title: req.body.title,
                                category: req.body.category,
                                description: req.body.description,
                                createdBy: req.decoded.userId,
                                image: filename
                            });
                            item.save((err) => {
                                if (err) {
                                    res.json({
                                        success: false,
                                        message: err
                                    });
                                } else {
                                    res.json({
                                        success: true,
                                        message: 'Item saved!'
                                    });
                                }
                            });

                        });
                        //     // req.files.forEach(function(file){
                        //     //     const filename = (new Date).valueOf() + "-" + file.originalname;
                        //     //     fs.rename(file.path, './Client/src/assets/uploads/images/' + filename, function(err){
                        //     //         if(err) throw err;

                        //     }); 
                        // });
                    }
                }

            }
        }
    });

    // router.get('/allItems', (req, res) => {
    //     Item.find({}, (err, items) => {
    //         if (err) {
    //             res.json({
    //                 success: false,
    //                 message: err
    //             });
    //         } else {
    //             if (!items) {
    //                 res.json({
    //                     success: false,
    //                     message: 'No items found'
    //                 });
    //             } else {
    //                 res.json({
    //                     success: true,
    //                     items: items
    //                 });
    //             }
    //         }
    //     }).sort({
    //         '_id': -1
    //     });
    // });



    router.get('/allItems', (req, res) => {
        Item.find({}, (err, items) => {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            } else {
                items = items.map((item) => {
                    return Eval.find({ itm: item.id }, (err, evals) => {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            return evals;
                        }
                    }).then((evals) => {
                        let r = 0;
                        let g = 0;
                        let y = 0;
                        for (i = 0; i < evals.length; i++) {
                            if (evals[i].note <= 1) {
                                r = r + 1;
                            } else if (evals[i].note <= 3 && evals[i].note >= 2) {
                                y = y + 1;
                            }
                            else if (evals[i].note <= 5 && evals[i].note >= 4) {
                                g = g + 1;
                            }
                        }
                        return {
                            _id: item._id, 
                            title: item.title, 
                            category: item.category, 
                            description: item.description, 
                            createdBy: item.createdBy, 
                            image: item.image,
                            createdAt: item.createdAt,
                            g:g, 
                            r:r, 
                            y:y
                        }
                    });
                });
                Promise.all(items).then((results) => {
                    res.json({
                        success: true,
                        items: results,
                    })
                })
            }
        }).sort({
            '_id': -1
        });
    });



    router.get('/singleItem/:id', (req, res) => {
        if (!req.params.id) {
            res.json({
                success: false,
                message: 'No Item Id was provided'
            });
        } else {
            Item.findOne({
                _id: req.params.id
            }, (err, item) => {
                if (err) {
                    res.json({
                        success: false,
                        message: 'not a valid item id'
                    });
                } else {
                    if (!item) {
                        res.json({
                            success: false,
                            message: 'Item not found'
                        });
                    } else {
                        User.findOne({
                            _id: req.decoded.userId
                        }, (err, user) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                if (!user) {
                                    res.json({
                                        success: false,
                                        message: 'Unable to authenticate user'
                                    });
                                } else {
                                    if (user.username !== item.createdBy) {
                                        res.json({
                                            success: false,
                                            message: 'You are not authorized to edit this item'
                                        });
                                    } else {
                                        res.json({
                                            success: true,
                                            item: item
                                        });

                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.get('/item', (req, res) => {
        if (req.query.title) {
            Item.findOne({}, (err, items) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    res.json({ success: true, message: items });
                }
            })
        }
    });

    router.get('/oneItem/:id', (req, res) => {
        Item.findOne({ _id: req.params.id }, (err, item) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                res.json({ success: true, item: item });
            }
        })
    })


    router.put('/updateItem', (req, res) => {
        if (!req.body._id) {
            res.json({
                success: false,
                message: 'no item id provided'
            });
        } else {
            Item.findOne({
                _id: req.body._id
            }, (err, item) => {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Not a valid Item id'
                    });
                } else {
                    if (!item) {
                        res.json({
                            success: false,
                            message: 'item id was not found'
                        });
                    } else {
                        User.findOne({
                            _id: req.decoded.userId
                        }, (err, user) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                if (!user) {
                                    res.json({
                                        success: false,
                                        message: 'Unable to authenticate user.'
                                    });
                                } else {
                                    if (user.username !== item.createdBy) {
                                        res.json({
                                            success: false,
                                            message: 'you are not authorize to edit this item'
                                        });
                                    } else {
                                        item.title = req.body.title;
                                        item.category = req.body.category;
                                        item.evaluation = req.body.evaluation;
                                        item.price = req.body.price;
                                        item.description = req.body.description;
                                        item.save((err) => {
                                            if (err) {
                                                res.json({
                                                    success: false,
                                                    message: err
                                                });
                                            } else {
                                                res.json({
                                                    success: true,
                                                    message: 'Item Updated'
                                                });
                                            }
                                        })
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });



    // router.post('/comment', (req, res) => {
    //     // Check if comment was provided in request body
    //     if (!req.body.comment) {
    //         res.json({
    //             success: false,
    //             message: 'No comment provided'
    //         }); // Return error message
    //     } else {
    //         // Check if id was provided in request body
    //         if (!req.body.id) {
    //             res.json({
    //                 success: false,
    //                 message: 'No id was provided'
    //             }); // Return error message
    //         } else {
    //             // Use id to search for blog post in database
    //             Item.findOne({
    //                 _id: req.body.id
    //             }, (err, item) => {
    //                 // Check if error was found
    //                 if (err) {
    //                     res.json({
    //                         success: false,
    //                         message: 'Invalid item id'
    //                     }); // Return error message
    //                 } else {
    //                     // Check if id matched the id of any item post in the database
    //                     if (!item) {
    //                         res.json({
    //                             success: false,
    //                             message: 'Item not found.'
    //                         }); // Return error message
    //                     } else {
    //                         // Grab data of user that is logged in
    //                         User.findOne({
    //                             _id: req.decoded.userId
    //                         }, (err, user) => {
    //                             // Check if error was found
    //                             if (err) {
    //                                 res.json({
    //                                     success: false,
    //                                     message: 'Something went wrong'
    //                                 }); // Return error message
    //                             } else {
    //                                 // Check if user was found in the database
    //                                 if (!user) {
    //                                     res.json({
    //                                         success: false,
    //                                         message: 'User not found.'
    //                                     }); // Return error message
    //                                 } else {
    //                                     // Add the new comment to the blog post's array
    //                                     item.comments.push({
    //                                         comment: req.body.comment, // Comment field
    //                                         commentator: user.username // Person who commented
    //                                     });
    //                                     // Save blog post
    //                                     item.save((err) => {
    //                                         // Check if error was found
    //                                         if (err) {
    //                                             res.json({
    //                                                 success: false,
    //                                                 message: 'Something went wrong.'
    //                                             }); // Return error message
    //                                         } else {
    //                                             res.json({
    //                                                 success: true,
    //                                                 message: 'Comment saved'
    //                                             }); // Return success message
    //                                         }
    //                                     });
    //                                 }
    //                             }
    //                         });
    //                     }
    //                 }
    //             });
    //         }
    //     }
    // });

    return router;
};