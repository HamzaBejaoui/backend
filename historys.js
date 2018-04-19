const User = require('../models/user');
const Item = require('../models/item');
const Eval = require('../models/eval');
const History = require('../models/history');
const Comment = require('../models/comment');
const config = require('../config/database');
const mongoose = require('mongoose');


module.exports = (router) => {

    router.get('/historyComment', (req, res) => {
        User.findOne({
            _id: req.decoded.userId
        }, (err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                Comment.find({
                    commentator: user._id
                }, (err, comment) => {
                    if(err){
                        res.json({success: false, message: err});
                    }else {
                        res.json({comment});
                    }
                })   
            }
        });
    });


    return router;
}