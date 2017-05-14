var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var moment = require('moment');
var md5 = require('md5');
var db = require('../db').db;
var async=require('async');
var _ = require('underscore');
var xlsx = require('node-xlsx').default;
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
        db.collection('user').updateOne({id:req.body.id.toUpperCase()},{$set:obj},{upsert:true},function (err,rst) {
            if (err){
                res.status(401)
            }else {
                res.send(rst)
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
            var obj=req.body;
            obj.id=req.body.id.toUpperCase();
            db.collection('fee').updateOne({id:req.body.id.toUpperCase()},{$set:obj},{upsert:true},function (err,rst) {
                if (err){
                    res.status(401)
                }else {
                    res.send(rst)
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
                res.json({rst1: rst, rst2: []});
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
    db.collection('hotel').findOne({hotel:req.body.hotel,room:req.body.room},function (err, rst) {
        var roomPrice = rst.price;
        var begin = moment(req.body.begin).unix();
        var end = moment(req.body.end).unix();
        var totalPrice=0;
        db.collection('stay_info').find({id:{$ne:req.body.id},hotel:rst.hotel,room:rst.room}).toArray(function (err, rst) {
            for (begin;begin<=end;begin=begin+86400){
                var roomUser = _.filter(rst,function (item) {
                    var t_begin = moment(item.begin).unix();
                    var t_end = moment(item.end).unix();
                    return t_begin<=begin && begin <= t_end
                });
                //console.log(roomUser.length);
                totalPrice+=roomPrice/(roomUser.length+1)
            }
            console.log(totalPrice);
            res.send(totalPrice);
        });
    })
});

router.route('/savestayinfo').post(function (req, res) {
    var obj = req.body;
    db.collection('stay_info').updateOne({id:req.body.id},{$set:obj},{upsert:true},function (err, rst) {
        db.collection('stay_info').find({id:{$ne:req.body.id},hotel:req.body.hotel,room:req.body.room}).toArray(function (err,rst){
            async.map(rst,function (item, callback) {
                caculate(item.id)//here
            });
        })
    })
});


function caculate(userId) {
    async.waterfall([function (callback) {
        db.collection('stay_info').findOne({id:userId},callback);
    },function (stayInfo, callback) {
        db.collection('hotel').findOne({hotel:stayInfo.hotel,room:stayInfo.room},function (err, rst) {
            callback(err,rst,stayInfo)
        })
    }],function (err,hotelInfo,stayInfo) {
        var begin = moment(stayInfo.begin).unix();
        var end = moment(stayInfo.end).unix();
        var roomPrice = hotelInfo.price;
        var totalPrice=0;
        db.collection('stay_info').find({id:{$ne:userId},hotel:stayInfo.hotel,room:stayInfo.room}).toArray(function (err, rst) {
            for (begin;begin<=end;begin=begin+86400){
                var roomUser = _.filter(rst,function (item) {
                    var t_begin = moment(item.begin).unix();
                    var t_end = moment(item.end).unix();
                    return t_begin<=begin && begin <= t_end
                });
                console.log(roomUser.length);
                totalPrice+=roomPrice/(roomUser.length+1)
            }
            console.log(totalPrice);
            db.collection('stay_info').updateOne({id:stayInfo.id},{$set:{totalPrice:totalPrice}})
        });
    });
}

router.route('/test').post(function (req, res) {
    var userId = '130302198110311444';
    var a = '2017-05-11';
    var b = '2017-05-12';
    var mmt = moment(a).add(1,'days').unix();
    var am = moment(a).unix();
    var bm = moment(b).unix();
    var datea = new Date(mmt*1000);
    var dateb = new Date(Date.parse(b));
    var p = caculate('310109199012019999');
    console.info('p'+p)
    //console.info(am+86400)
});


/******api***************************************************************************************/
module.exports = router;
