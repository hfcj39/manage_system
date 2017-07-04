var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var moment = require('moment');
var md5 = require('md5');
var db = require('../db').db;
var async=require('async');
var _ = require('underscore');
//var xlsx = require('node-xlsx').default;
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
            username:req.body.username,
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
    function (req, res) {
        var obj = {
            username:req.body.username,
            password:md5(req.body.password)
        };
        console.log(obj);
        db.collection('admin').findOne({username:req.body.username},function (err,rst) {
            console.log(rst);
            if (err){
                console.log(err)
                res.status(401);
            }else if(!err){
                console.log('here')
                db.collection('admin').insertOne(obj,function (err,rst) {
                    if (err){
                        res.status(401)
                    }else {
                        console.log(rst+2);
                        res.send(rst)
                    }
                });
            }else {
                db.collection('admin').updateOne({username:req.body.username},{$set:obj},function (err,rst) {
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
        delete obj._id;
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
            delete obj._id;
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
/******traffic*************************************************************************************/
router.route('/gettraffic').post(function (req, res) {
    db.collection('traffic').findOne({id:req.body.id},function (err, rst) {
        if (err){
            res.status(401)
        }else {
            res.send(rst)
        }
    })
});
router.route('/edittraffic').post(
    ensureAuthenticated,
    function (req,res){
        if (req.body.id){
            var obj=req.body;
            delete obj._id;
            obj.id=req.body.id.toUpperCase();
            db.collection('traffic').updateOne({id:req.body.id.toUpperCase()},{$set:obj},{upsert:true},function (err,rst) {
                if (err){
                    res.status(401)
                }else {
                    res.send(rst)
                }
            });
        }
    }
);
/******traffic*************************************************************************************/
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

    }else {
        res.send('no rst')
    }
});
router.route('/calculateprice').post(/*ensureAuthenticated ,*/function(req, res) {
    db.collection('hotel').findOne({hotel:req.body.hotel,room:req.body.room},function (err, rst) {
        var roomPrice = rst.price;
        var begin = moment(req.body.begin).unix()+86400;
        var end = moment(req.body.end).unix();
        var totalPrice=0;
        db.collection('stay_info').find({id:{$ne:req.body.id},hotel:rst.hotel,room:rst.room}).toArray(function (err, rst) {
            for (begin;begin<=end;begin=begin+86400){
                var roomUser = _.filter(rst,function (item) {
                    var t_begin = moment(item.begin).unix()+86400;
                    var t_end = moment(item.end).unix();
                    return t_begin<=begin && begin <= t_end
                });
                //console.log(roomUser.length);
                totalPrice+=roomPrice/(roomUser.length+1)
            }
            console.log(totalPrice);
            res.send({price:totalPrice});
        });
    })
});

router.route('/savestayinfo').post(function (req, res) {
    var obj = req.body;
    delete obj._id;
    // console.log(obj);
    db.collection('stay_info').updateOne({id:req.body.id},{$set:obj},{upsert:true},function (err, rst1) {
        // console.log(err,rst1);
        db.collection('stay_info').find({id:{$ne:req.body.id},hotel:req.body.hotel,room:req.body.room}).toArray(function (err,rst){
            async.map(rst,function (item) {
                caculate(item.id)//here
            });
            res.send(rst1)
        })
    })
});

router.route('/getstayinfo').post(function (req, res) {
    db.collection('stay_info').findOne({id:req.body.id},function (err, rst) {
        if (err){
            res.status(401)
        }else {
            res.send(rst)
        }
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
            var chaeshui = (stayInfo.kaipiaojine-totalPrice)*0.05;
            db.collection('stay_info').updateOne({id:stayInfo.id},{$set:{totalPrice:totalPrice,chaeshui:chaeshui}})
        });
    });
}

router.route('/feeexecl').get(function (req, res) {
    var fileName='fee.xls';
    res.set({
        'Content-Type': 'application/vnd.ms-execl',
        'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
        'Pragma':'no-cache',
        'Expires': 0
    });
    db.collection('fee').find().toArray(function (err, rst) {
        var arr=rst;
        async.mapSeries(rst,function (item,callback) {
            console.log('item'+item.id);
            db.collection('user').findOne({id:item.id},function (err, user_rst) {
                item.name=user_rst.name;
                callback(err,item)
            });
        },function (err,item) {
            arr.unshift({
                name:'姓名',
                id:'身份证',
                chaeshui:'差额税',
                yingfufeiyong:'应付费用',
                fapiaotaitou:'发票抬头',
                yingshoufeiyong:'应收费用',
                kaipiaojine:'开票金额',
                jiudianshuaka:'酒店刷卡',
                huiwugongsishuaka:'会务公司刷卡',
                xianjin:'现金',
                shoufeizhuangtai:'收费状态'
            });
            var content='';
            for(var i=0,len=arr.length;i<len;i++){
                content+=arr[i]['name'];
                content+='\t';
                content+=arr[i]['id'];
                content+='\t';
                content+=arr[i]['chaeshui'];
                content+='\t';
                content+=arr[i]['yingfufeiyong'];
                content+='\t';
                content+=arr[i]['fapiaotaitou'];
                content+='\t';
                content+=arr[i]['yingshoufeiyong'];
                content+='\t';
                content+=arr[i]['kaipiaojine'];
                content+='\t';
                content+=arr[i]['jiudianshuaka'];
                content+='\t';
                content+=arr[i]['huiwugongsishuaka'];
                content+='\t';
                content+=arr[i]['xianjin'];
                content+='\t';
                content+=arr[i]['shoufeizhuangtai'];
                content+='\t';
                content+='\t\n';
            }
            var buffer = new Buffer(content);
            //需要转换字符集
            var iconv = require('iconv-lite');
            var str=iconv.encode(buffer,'gb2312');
            res.send(str);
        });

    });
});

router.route('/userexecl').get(function(req,res){
    var fileName= "user.xls";
    res.set({
        'Content-Type': 'application/vnd.ms-execl',
        'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
        'Pragma':'no-cache',
        'Expires': 0
    });
    db.collection('user').find().toArray(function (err, rst) {
        var arr=rst;
        arr.unshift({
            name:'姓名',
            gender:'性别',
            id:'身份证',
            career:'身份',
            province:'地区',
            company:'公司',
            phone:'电话',
            email:'邮箱',
            address:'地址',
            comment:'备注'
        });

        var content='';
        for(var i=0,len=arr.length;i<len;i++){
            content+=arr[i]['name'];
            content+='\t';
            content+=arr[i]['gender'];
            content+='\t';
            content+=arr[i]['id'];
            content+='\t';
            content+=arr[i]['career'];
            content+='\t';
            content+=arr[i]['province'];
            content+='\t';
            content+=arr[i]['company'];
            content+='\t';
            content+=arr[i]['phone'];
            content+='\t';
            content+=arr[i]['email'];
            content+='\t';
            content+=arr[i]['address'];
            content+='\t';
            content+=arr[i]['comment'];
            content+='\t';
            content+='\t\n';
        }
        var buffer = new Buffer(content);
        //需要转换字符集
        var iconv = require('iconv-lite');
        var str=iconv.encode(buffer,'gb2312');
        res.send(str);
    })
    //var arr=[{name:'张三',age:'32岁'},{name:'李四',age:'60岁'},{name:'王五',age:'10岁'},{name:'赵六',age:'100岁'}];

});

router.route('/stayexecl').get(function (req, res) {
    var fileName='stay_info.xls';
    res.set({
        'Content-Type': 'application/vnd.ms-execl',
        'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
        'Pragma':'no-cache',
        'Expires': 0
    });
    db.collection('stay_info').find().toArray(function (err, rst) {
        var arr=rst;
        async.mapSeries(rst,function (item,callback) {
            console.log('item'+item.id);
            db.collection('user').findOne({id:item.id},function (err, user_rst) {
                item.name=user_rst.name;
                callback(err,item)
            });
        },function (err,item) {
            arr.unshift({
                name:'姓名',
                id:'身份证',
                zhusuyaoqiu:'住宿要求',
                hotel:'酒店',
                room:'房间',
                begin:'开始日期',
                end:'结束日期',
                totalprice:'总价',
                fangjianjiage:'房间价格',
                fapiaotaitou:'发票抬头',
                kaipiaojine:'开票金额',
                chaeshui:'差额税',
                yingfufeiyong:'应付费用',
                jiudianshuaka:'酒店刷卡',
                huiwugongsishuaka:'会务公司刷卡',
                xianjin:'现金',
                shoufeizhuangtai:'收费状态'
            });
            var content='';
            for(var i=0,len=arr.length;i<len;i++){
                content+=arr[i]['name'];
                content+='\t';
                content+=arr[i]['id'];
                content+='\t';
                content+=arr[i]['zhusuyaoqiu'];
                content+='\t';
                content+=arr[i]['hotel'];
                content+='\t';
                content+=arr[i]['room'];
                content+='\t';
                content+=arr[i]['begin'];
                content+='\t';
                content+=arr[i]['end'];
                content+='\t';
                content+=arr[i]['totalprice'];
                content+='\t';
                content+=arr[i]['fangjianjiage'];
                content+='\t';
                content+=arr[i]['fapiaotaitou'];
                content+='\t';
                content+=arr[i]['kaipiaojine'];
                content+='\t';
                content+=arr[i]['chaeshui'];
                content+='\t';
                content+=arr[i]['yingfufeiyong'];
                content+='\t';
                content+=arr[i]['jiudianshuaka'];
                content+='\t';
                content+=arr[i]['huiwugongsishuaka'];
                content+='\t';
                content+=arr[i]['xianjin'];
                content+='\t';
                content+=arr[i]['shoufeizhuangtai'];
                content+='\t';
                content+='\t\n';
            }
            var buffer = new Buffer(content);
            //需要转换字符集
            var iconv = require('iconv-lite');
            var str=iconv.encode(buffer,'gb2312');
            res.send(str);
        });

    });
});
/******api***************************************************************************************/
router.route('/test1').post(function (req, res) {
    db.collection('stay_info').find().toArray(function (err, rst) {
        var arr=rst;
        async.mapSeries(rst,function (item,callback) {
            console.log('item'+item.id);
            db.collection('user').findOne({id:item.id},function (err, user_rst) {
                item.name=user_rst.name;
                callback(err,item)
            });
        },function (err,item) {
            arr.unshift({
                name:'姓名',
                id:'身份证',
                zhusuyaoqiu:'住宿要求',
                hotel:'酒店',
                room:'房间',
                begin:'开始日期',
                end:'结束日期',
                totalprice:'总价',
                fangjianjiage:'房间价格',
                fapiaotaitou:'发票抬头',
                kaipiaojine:'开票金额',
                chaeshui:'差额税',
                yingfufeiyong:'应付费用',
                jiudianshuaka:'酒店刷卡',
                huiwugongsishuaka:'会务公司刷卡',
                xianjin:'现金',
                shoufeizhuangtai:'收费状态'
            });
            //console.log(arr)
            res.send(arr)
        });

    });
});
router.route('/test2').post(function (req, res) {
    db.collection('user').find().toArray(function (err, rst) {
        //var arr=rst;
        rst.unshift({
            name:'姓名',
            gender:'性别',
            id:'身份证',
            career:'身份',
            province:'地区',
            company:'公司',
            phone:'电话',
            email:'邮箱',
            address:'地址',
            comment:'备注'
        });
        res.send(rst)
    })
});
router.route('/test3').post(function (req, res) {
    db.collection('fee').find().toArray(function (err, rst) {
        var arr=rst;
        async.mapSeries(rst,function (item,callback) {
            console.log('item'+item.id);
            db.collection('user').findOne({id:item.id},function (err, user_rst) {
                item.name=user_rst.name;
                callback(err,item)
            });
        },function (err,item) {
            arr.unshift({
                name:'姓名',
                id:'身份证',
                chaeshui:'差额税',
                yingfufeiyong:'应付费用',
                fapiaotaitou:'发票抬头',
                yingshoufeiyong:'应收费用',
                kaipiaojine:'开票金额',
                jiudianshuaka:'酒店刷卡',
                huiwugongsishuaka:'会务公司刷卡',
                xianjin:'现金',
                shoufeizhuangtai:'收费状态'
            });
            res.send(arr);
        });

    });
});
module.exports = router;
