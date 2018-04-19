const User = require('../models/user');
const Item = require('../models/item');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Eval = require('../models/eval');

module.exports = (router) => {

    function createComment(req, res, color, eval){
        Item.findOne({
            _id: req.body.id
        }, (err, item) => {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
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
                        const comment = new Comment({
                            comment: req.body.comment,
                            commentator: req.decoded.userId,
                            itm: item._id,
                            eval: eval,
                            color:color
                        });
                        comment.save((err) => {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                res.json({
                                    success: true,
                                    message: 'Comment saved'
                                });
                            }
                        })
                    }
                })
            }
        })
    }
    router.post('/comment', (req, res) => {
        let color;
        if(req.body.evalId){
            return Eval.findOne({_id: req.body.evalId}).exec().then((evaluation) => {
                if(evaluation){
                    if(evaluation.note <= 1){
                        color = "red";
                    }else if (evaluation.note <= 3){
                        color = "yellow";
                    }else{
                        color = "green";
                    }
                    return createComment(req, res, color, evaluation._id);                
                }
            })    
        }
        return createComment(req, res, null, null);
        

    });


    router.get('/allComments/:id', (req, res) => {
        Item.findOne({
            _id: req.params.id
        }, (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
            } else {
                Comment.find({ itm: req.params.id }, (err, comment) => {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        comment = comment.map(element => {
                            return User.findOne({_id : element.commentator},(err, commentor) => {
                                return commentor;
                            }).then((commentor) => {
                                return {
                                    _id: element._id,
                                    comment: element.comment, 
                                    commentedAt: element.commentedAt,
                                    commentatorId: element.commentator,
                                    color: element.color,
                                    commentator : commentor.username
                                };
                            });
                        });
                        Promise.all(comment).then(function(results){
                            res.json({
                                success: true,
                                comment: results
                            });
                        })
                        
                    }
                }).sort({
                    '_id': -1
                })
            }
        });

    });
    return router;
}