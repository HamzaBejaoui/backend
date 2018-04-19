const User = require('../models/user');
const Item = require('../models/item');
const Eval = require('../models/eval');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const multer = require('multer');
const upload = multer({
    dest: './Client/src/assets/uploads/imagesEval/'
});
const fs = require('fs');

module.exports = (router) => {
    router.post('/newEval/:id', upload.any(), (req, res) => {

        let filename = (new Date).valueOf() + "-" + req.body.image.filename;
        let note = (parseInt(req.body.price) + parseInt(req.body.service) + parseInt(req.body.quality)) / 3;
        fs.writeFile("./Client/src/assets/uploads/imagesEval/" + filename, req.body.image.value, 'base64', function (err) {
            const ev = new Eval({
                price: req.body.price,
                service: req.body.service,
                quality: req.body.quality,
                note: note,
                image: filename,
                evaluatBy: req.decoded.userId,
                itm: req.params.id
            });          
            ev.save((err) => {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    });
                } else {
                    res.json({
                        success: true,
                        message: 'evaluation saved',
                        eval_id: ev._id
                    });
                }
            });
        });


    });




    // router.put('/updateEval/:id', (req, res ) => {
    //     User.find({}, (err, user) => {
    //         if(err){
    //             res.json({success: false, message: err});
    //         }else {
    //             Eval.findOne({
    //                 itm: req.params.id ,
    //                 evaluatBy: User._id
    //             }, (err, eval) => {
    //                 if(err){
    //                     res.json({success: false, message: err});
    //                 } else{
    //                     console.log(user);
    //                     console.log(req.params.id);

    //                     eval.price = req.body.price;
    //                     eval.service = req.body.service;
    //                     eval.quality = req.body.quality;
    //                     console.log(eval);
    //                     eval.save((err) => {
    //                         if(err){
    //                             res.json({ success: false, message: err });
    //                         } else{
    //                             res.json({success: true, message: "evaluation updated"});
    //                         }
    //                     })
    //                 }
    //             })
    //         }
    //     })
    // })


    router.get('/singleEval/:id', (req, res) => {
        Eval.find({
            itm: req.params.id
        }, (err, eval) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                User.findOne({
                    _id: req.decoded.userId
                }, (err, user) => {
                    for(i = 0; i < eval.length; i++){
                        if(user._id.equals(eval[i].evaluatBy)){
                            res.json({success: true, eval:eval[i]});
                        }
                    }
                })
            }
        })
    });


    router.put('/UpdateEval/:id', (req, res) => {
        let note = (parseInt(req.body.price) + parseInt(req.body.service) + parseInt(req.body.quality)) / 3;
        Eval.find({
            itm: req.params.id
        }, (err, eval) => {
            if(err){
                res.json({ success: false, message: err });
            } else{
                User.findOne({
                    _id: req.decoded.userId
                }, (err, user) => {
                    // if(user._id !== eval.evaluatBy){
                    //     console.log("hedha el user ", user._id);
                    //     console.log("w hedha el evaluat by", eval.evaluatBy);
                    //     console.log("u dont have to update ur eval");
                    // }
                    for(i = 0; i < eval.length; i++){
                        if(user._id.equals(eval[i].evaluatBy)){
                                eval[i].price = req.body.price;
                                console.log(req.body.price);
                                eval[i].service = req.body.service;
                                eval[i].quality = req.body.quality;
                                eval[i].note = note;
                                eval[i].save((err) => {
                                    if(err){
                                        res.json({ success : false, message: err });
                                    } else {
                                        res.json({ success : true, message: "evaluation updated" });
                                    }
                                });
                        }
                    }
                    // if(user._id.equals(eval.evaluatBy)){
                    //     eval.price = req.body.price;
                    //     eval.service = req.body.service;
                    //     eval.quality = req.body.quality;
                    //     eval.note = note;
                    //     console.log("evaluatd by ", eval.evaluatBy);
                    //     console.log("user ", user._id);
                    //     eval.save((err) => {
                    //         if(err){
                    //             res.json({ success : false, message: err });
                    //         } else {
                    //             res.json({ success : true, message: "evaluation updated" });
                    //         }
                    //     });
                    // }
                });
            }
        });
    });


    // router.put('/UpdateEval/:id', (req, res) => {
    //     let note = (parseInt(req.body.price) + parseInt(req.body.service) + parseInt(req.body.quality)) / 3;
    //     Eval.find({
    //         itm: req.params.id
    //     }, (err, eval) => {
    //         if(err) {
    //             res.json({ success: false, message: err });
    //         } else {
                
    //             User.find({
    //             }, (err, user) => {
    //                 if(err){
    //                     res.json({ success: false, message: err });
    //                 } else {
    //                     j = 0;
    //                     for(i = 0; i < eval.length; i++){
    //                         if((user[j]._id).equals(eval[i].evaluatBy)){
    //                             eval[i].price = req.body.price;
    //                             eval[i].service = req.body.service;
    //                             eval[i].quality = req.body.quality;
    //                             eval[i].note = note;
    //                             console.log("evaluatd by ", eval[i].evaluatBy);
    //                             console.log("user ", user[j]._id);
    //                             eval[i].save((err) => {
    //                                 if(err){
    //                                     res.json({ success : false, message: err });
    //                                 } else {
    //                                     res.json({ success : true, message: "evaluation updated" });
    //                                 }
    //                             })
    //                         }else{
    //                             j++;                                
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //     })
    // })



    router.get('/AllEval/:id', (req, res) => {
        r = 0;
        y = 0;
        g = 0;
        redService = 0;
        yellowService = 0;
        greenService = 0;
        redQuality = 0;
        yellowQuality = 0;
        greenQuality = 0;
        redPrice = 0;
        yellowPrice = 0;
        greenPrice = 0;
        Item.findOne({
            _id: req.params.id
        }, (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            } else {
                Eval.find({
                    itm: req.params.id
                }, (err, eval) => {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        for (i = 0; i < eval.length; i++) {
                           
                            if (eval[i].note <= 1) {
                               
                                r ++;
                            } else if (eval[i].note <= 3 && eval[i].note >= 2) {
                                y ++;
                            } else if  (eval[i].note <= 5 && eval[i].note >= 4) {
                                g++;
                            } 
                            if(eval[i].service <= 1){   
                                redService ++;
                            } else if(eval[i].service <=3 && eval[i].service >=2 ){
                                yellowService++;
                            }else if(eval[i].service <=5 && eval[i].service >=4){
                                greenService ++;
                            }
                            if(eval[i].quality <=1){
                                redQuality++;
                            }else if(eval[i].quality <=3 && eval[i].quality >=2){
                                yellowQuality++;
                            }else if(eval[i].quality <=5 && eval[i].quality >=4){
                                greenQuality++;
                            }
                            if(eval[i].price <=1){
                                redPrice++;
                            }else if(eval[i].price <=3 && eval[i].price >=2){
                                yellowPrice++;
                            }else if(eval[i].price <=5 && eval[i].price >=4){
                                greenPrice++;
                            }
                        }
                        res.json({
                            success: true,
                            eval,
                            r: r,
                            y,
                            g,
                            redService,
                            yellowService,
                            greenService,
                            redQuality,
                            yellowQuality,
                            greenQuality,
                            redPrice,
                            yellowPrice,
                            greenPrice
                        });
                    }
                })
            }
        });
    })




    // router.get('/getAllEval', (req, res) => {
    //     R = 0; 
    //     Y;
    //     G;
    //     Eval.find({}, (err, eval) => {
    //         if(err){
    //             res.json({ success: false, message: 'Eval not found' });
    //         } else{
    //             User.find({}, (err, user) => {
    //                 if(err) {
    //                     res.json({ success: false, message: 'no users found' });    
    //                 }else{
    //                     Item.findOne({
    //                         _id: req.params.id
    //                     }, (err) => {
    //                         if(err){
    //                             res.json({ success: false, message: 'item not found' });
    //                         }else{
    //                             if(eval.note < 3){
    //                                 R = R + 1;
    //                             }
    //                             console.log(R);
    //                         }
    //                     })
    //                 }
    //             })
    //         }
    //     })
    // });

    return router;
}