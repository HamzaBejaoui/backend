
const User = require('../models/user');
const Item = require('../models/item');
const Follow = require('../models/follow');
const config = require('../config/database');
const mongoose = require('mongoose');

module.exports = (router) => {

    //New follower
    router.post('/follow', (req, res) => {
        const f = new Follow({
            follower : req.body.follower,
            following : req.body.following 
        });
        f.save((err) => {
            if(err){
                res.json({success : false, message:err});
            }else{
                res.json({success : true, message: 'follow saved'});
            }
        });
    });


    //Unfollow
    router.delete('/unfollow/:id', (req, res) => {
        Follow.findOne({following : req.params.id}, (err, follow) =>{
            
            if(err) {
                res.json({ success: false, message: err });
            } else {
                Follow.remove( {_id: mongoose.Types.ObjectId(req.params.id)}, (err) => {
                    if(err) {
                        res.json({success: false, message: err});
                    }else {
                        res.json({success: true, message:'unfollow deleted'});
                    }
                });
            }
        });
    });

    //Item is followed by
    router.get('/followedBy/:id', (req, res) => {
        Follow.find({ following : req.params.id }, (err, follow) =>{
            if(err){
                res.json({ success: false, message : err });
            } else{
                res.json({  follow });
            }
        });
    });

    router.get('/followers', (req, res) => {
        Follow.find({}, (err, followers) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                res.json({followers});
            }
        });
    });

    //Verify follower
    router.post('/verifyFollower', (req, res) => {
        const follow = req.body;
        
        if(!follow.follower || !(follow.following + '')) {
            res.status(400);
            res.json({ success: false, message: "bad data " });
        }else {
            Follow.findOne({ follower: follow.follower, following: follow.following }, (err, f) =>{
                console.log(f);
                if(err){
                    res.json({ success: false, message : "err on search verify ",err });
                }else{
                    res.json({ f });
                }

                
            })
            
        }
    })


    return router
};