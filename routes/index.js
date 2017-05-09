var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var moment = require('moment');
var md5 = require('md5');
var db = require('../db').db;
var async=require('async');
var _ = require('underscore');
/******auth**************************************************************************************/
/*creat token*/
function ctoken(name) {
    var period = moment().add(1,'days').unix();
    var payload = {
        sub:name,
        iat:moment().unix(),
        exp:period
    };
    var secret = 'ZnVja3NoaXQ=';
    return jwt.encode(payload,secret);
}
/*check token*/
function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')){
        return res.status(401).send({err:'不存在Authorization'})
    }
    var token = req.header('Authorization').split(' ')[1];
    var secret = 'ZnVja3NoaXQ=';
    var payload = null;
    try {
        payload = jwt.decode(token,secret);
    }catch (err){
        return res.status(401).send({err:'请重新登录'});
    }
    if (payload.exp <= moment().unix()){
        return res.status(401).send({err:'验证已过期'})
    }
    req.username = payload.sub;
    next()
}
/*auth*/
router.route('/signin').post(
    function (req, res) {
        db.collection('admin').findOne({
            username:md5(req.body.username),
            password:md5(req.body.password)
            }, function (err, rst) {
                if (err || !rst){
                    res.status(401).send({err:'账号密码错误'})
                }else {
                    var token = ctoken(req.body.username);
                    res.send({token:token})
                }
            }
        )
    }
);
router.route('/signup').post(
    ensureAuthenticated,
    function (req, res) {
        var obj = {
            username:md5(req.body.username),
            password:md5(req.body.password)
        };
        db.collection('admin').findOne({username:md5(req.body.username)},function (err,rst) {
            //console.log(rst);
            if (err){
                res.status(401);
            }else if(!rst){
                db.collection('admin').insertOne(obj,function (err,rst) {
                    if (err){
                        res.status(401)
                    }else {
                        res.send(rst)
                    }
                });
            }else {
                db.collection('admin').updateOne({username:md5(req.body.username)},{$set:obj},function (err,rst) {
                    if (err){
                        res.status(401)
                    }else {
                        res.send(rst)
                    }
                });
            }
        })
    }
);
/******auth**************************************************************************************/

/******user**************************************************************************************/
/*find*/
router.route('/finduser').get(
    ensureAuthenticated,
    function (req, res) {
        db.collection('user').find().toArray(function (err, rst) {
            if (err){
                res.status(401)
            }else {
                res.send(rst)
            }
        })
    }
    )
    .post(
        ensureAuthenticated,
        function (req, res) {
            var obj=req.body.id.toUpperCase();
            db.collection('user').findOne({id:obj},function (err, rst) {
                if (err){
                    res.status(401)
                }else {
                    res.send(rst)
                }
            })
        }
    );
/*insert && update && delete*/
router.route('/edituser').post(
    ensureAuthenticated,
    function (req,res){
        var obj=req.body;
        obj.id=req.body.id.toUpperCase();
        db.collection('user').findOne({id:req.body.id.toUpperCase()},function (err,rst) {
            if (err){
                res.status(401);
            }else if(!rst){
                db.collection('user').insertOne(obj,function (err,rst) {
                    if (err){
                        res.status(401)
                    }else {
                        res.send(rst)
                    }
                });
            }else {
                db.collection('user').updateOne({id:req.body.id.toUpperCase()},{$set:obj},function (err,rst) {
                    if (err){
                        res.status(401)
                    }else {
                        res.send(rst)
                    }
                });
            }
        });
    }
)
    .get(ensureAuthenticated ,function(req,res) {
        db.collection('user').deleteOne({id:req.query.id.toUpperCase()},function (err,rst) {
            if (err){
                res.status(401)
            }else {
                res.send(rst)
            }
        });
    });
/******user**************************************************************************************/

/******fee***************************************************************************************/
/*find*/
router.route('/findfee')
    .post(
        ensureAuthenticated,
        function (req, res) {
            var obj=req.body.id.toUpperCase();
            db.collection('fee').findOne({id:obj},function (err, rst) {
                if (err){
                    res.status(401)
                }else {
                    res.send(rst)
                }
            })
        }
    );
/*insert && update && delete*/
router.route('/editfee').post(
    ensureAuthenticated,
    function (req,res){
        if (req.body.id){
            var obj = req.body;
            obj.id = obj.id.toUpperCase();
            db.collection('fee').findOne({id:req.body.id.toUpperCase()},function (err,rst) {
                if (err){
                    res.status(401);
                }else if(!rst){
                    db.collection('fee').insertOne(obj,function (err,rst) {
                        if (err){
                            res.status(401)
                        }else {
                            res.send(rst)
                        }
                    });
                }else {
                    db.collection('fee').updateOne({id:req.body.id.toUpperCase()},{$set:obj},function (err,rst) {
                        if (err){
                            res.status(401)
                        }else {
                            res.send(rst)
                        }
                    });
                }
            });
        }
    }
)
    .get(ensureAuthenticated ,function(req,res) {
        if (req.body.id){
            db.collection('fee').deleteOne({id:req.query.id.toUpperCase()},function (err,rst) {
                if (err){
                    res.status(401)
                }else {
                    res.send(rst)
                }
            });
        }
    });
/******fee***************************************************************************************/

/******hotel*************************************************************************************/
/*find*/
router.route('/findhotel').get(//查所有记录
    ensureAuthenticated,
    function (req, res) {
        db.collection('hotel').find().toArray(function (err, rst) {
            if (err){
                res.status(401)
            }else {
                res.send(rst)
            }
        })
    }
);
/*insert && update && delete*/
router.route('/edithotel').post(
    ensureAuthenticated,
    function (req,res){
        var obj={
            hotel:req.body.hotel,
            room:req.body.room,
            avalible_num:req.body.avalible_num,
            max_num:req.body.max_num,
            type:req.body.type,
            price:req.body.price
        };
        if (req.body._id){
            db.collection('hotel').updateById(req.body._id,{$set:obj},function (err,rst) {
                if (err){
                    res.status(401)
                }else {
                    res.send(rst)
                }
            });
        }else {
            db.collection('hotel').insertOne(obj,function (err,rst) {
                if (err){
                    res.status(401)
                }else {
                    res.send(rst)
                }
            });
        }
    }
);
router.route('/deletehotel')
    .post(ensureAuthenticated ,function(req,res) {
        //console.log(req.query);
        db.collection('hotel').deleteOne({hotel:req.body.hotel,room:req.body.room},function (err,rst) {
            if (err){
                res.status(401)
            }else {
                res.send(rst)
            }
        });
    });
/******hotel*************************************************************************************/

/******api***************************************************************************************/
router.route('/getroom').post(ensureAuthenticated ,function(req,res) {
    if(req.body.zhusuxuqiu==="单间"){//单间
        db.collection('hotel').find({$where:"this.avalible_num==this.max_num"}).toArray(function (err, rst) {
            if (err){
                res.status(401)
            }else {
                res.send(rst);
            }
        })
    }else if (req.body.zhusuxuqiu==="合住") {//合住
        async.waterfall([
            function(callback) {
                db.collection('hotel').find({$where:"this.avalible_num>0"}).toArray(callback);
            },
            function(results, callback) {
                async.mapSeries(results, function(item, callback){
                    async.waterfall([
                        function(callback) {
                            db.collection('stay_info').find({hotel:item.hotel,room:item.room}).toArray(callback);
                        },
                        function(rst, callback) {
                            db.collection('user').find({
                                id: {$in: _.map(rst, function(item) {
                                    return item.id;
                                })}
                            }).toArray(callback);
                        }
                    ], callback);
                }, function(err, rst) {
                    callback(err, results, rst);
                });
            }
        ], function(err, rst1, rst2) {
            if (err) return next(err);
            res.json({rst1: rst1, rst2: rst2});
        });

    }
});
router.route('/calculateprice').post(ensureAuthenticated ,function(req, res) {
    async.waterfall([function (callback) {
        db.collection('hotel').findOne({hotel:req.body.hotel,room:req.body.room},callback)
    },function (result, callback) {
        db.collection('stay_info').find({hotel:result.hotel,room:result.room}).count(function (err, rst) {
            var f=parseInt(result.price)/(rst+1);
            console.log(f);
            res.send({price:f.toFixed(2)})
        })
    }],function (err) {
        res.status(401)
    });
});

router.route('/test').post(function (req, res) {

});
/******api***************************************************************************************/
module.exports = router;
