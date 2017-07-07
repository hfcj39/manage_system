/**
 * Created by hfcj3 on 2017/7/6.
 */
var express = require('express');
var db = require('../db').db;
var async = require('async');
var iconv = require('iconv-lite');
var router = express.Router();


/**
 * zhusufapiaobiao
 */
router.route('/stay_fee_info_excel').get(function(req, res){
	var fileName='stay_fee_info.xls';
	res.set({
		'Content-Type': 'application/vnd.ms-execl',
		'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
		'Pragma':'no-cache',
		'Expires': 0
	});
	db.collection('stay_info').find().toArray(function (err, rst) {
		async.mapSeries(rst,function (item,callback) {
			// console.log('item'+item.id);
			db.collection('user').findOne({id:item.id},function (err, user_rst) {
				item.name=user_rst.name;//代表名称
				item.company=user_rst.company;//单位名称
				item.phone=user_rst.phone;//纳税人联系电话
				item.nashuirenshibiehao=user_rst.nashuirenshibiehao;//纳税人识别号
				item.fapiaotaitou=user_rst.fapiaotaitou;//发票抬头
				item.nashuirendizhi=user_rst.nashuirendizhi;//纳税人地址
				callback(err,item)
			});
		},function (err,arr) {
			arr.unshift({
				name:'姓名',
				id:'身份证',
				company:'单位名称',
				phone:'纳税人联系电话',
				nashuirendizhi:'纳税人地址',
				nashuirenshibiehao:'纳税人识别号',
				fapiaotaitou:'发票抬头',
				kaipiaojine:'开票金额',
				fapiaoneirong:'发票内容'
			});
			//console.log(arr)
			var content='';
			for(var i=0,len=arr.length;i<len;i++){
				content+=arr[i]['name'];
				content+='\t';
				content+=arr[i]['id'];
				content+='\t';
				content+=arr[i]['company'];
				content+='\t';
				content+=arr[i]['phone'];
				content+='\t';
				content+=arr[i]['nashuirendizhi'];
				content+='\t';
				content+=arr[i]['nashuirenshibiehao'];
				content+='\t';
				content+=arr[i]['fapiaotaitou'];
				content+='\t';
				content+=arr[i]['kaipiaojine'];
				content+='\t';
				content+=arr[i]['fapiaoneirong'];
				content+='\t';
				content+='\t\n';
			}
			var buffer = new Buffer(content);
			//需要转换字符集
			var str=iconv.encode(buffer,'gb2312');
			res.send(str);
		});
	});
});
router.route('/stay_fee_info').post(function(req, res){
	db.collection('stay_info').find().toArray(function (err, rst) {
		async.mapSeries(rst,function (item,callback) {
			db.collection('user').findOne({id:item.id},function (err, user_rst) {
				item.name=user_rst.name;//代表名称
				item.company=user_rst.company;//单位名称
				item.phone=user_rst.phone;//纳税人联系电话
				item.nashuirenshibiehao=user_rst.nashuirenshibiehao;//纳税人识别号
				item.fapiaotaitou=user_rst.fapiaotaitou;//发票抬头
				item.nashuirendizhi=user_rst.nashuirendizhi;//纳税人地址
				callback(err,item)
			});
		},function (err,arr) {
			arr.unshift({
				name:'姓名',
				id:'身份证',
				company:'单位名称',
				phone:'纳税人联系电话',
				nashuirendizhi:'纳税人地址',
				nashuirenshibiehao:'纳税人识别号',
				fapiaotaitou:'发票抬头',
				kaipiaojine:'开票金额',
				fapiaoneirong:'发票内容'
			});
			//console.log(arr)
			res.send(arr)
		});
	});
});
/**
 * huiwufeifapiaobiao
 */
router.route('/fee_info').post(function(req, res) {
	db.collection('fee').find().toArray(function (err, rst) {
		async.mapSeries(rst,function (item,callback) {
			db.collection('user').findOne({id:item.id},function (err, user_rst) {
				item.name=user_rst.name;//代表名称
				item.company=user_rst.company;//单位名称
				item.phone=user_rst.phone;//纳税人联系电话
				item.nashuirenshibiehao=user_rst.nashuirenshibiehao;//纳税人识别号
				item.fapiaotaitou=user_rst.fapiaotaitou;//发票抬头
				item.nashuirendizhi=user_rst.nashuirendizhi;//纳税人地址
				callback(err,item)
			});
		},function (err,arr) {
			arr.unshift({
				name:'姓名',
				id:'身份证',
				company:'单位名称',
				phone:'纳税人联系电话',
				nashuirendizhi:'纳税人地址',
				nashuirenshibiehao:'纳税人识别号',
				fapiaotaitou:'发票抬头',
				kaipiaojine:'开票金额',
				fapiaoneirong:'发票内容'
			});
			res.send(arr);
		});
	});
});
router.route('/fee_info_excel').get(function(req, res) {
	var fileName='fee_info.xls';
	res.set({
		'Content-Type': 'application/vnd.ms-execl',
		'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
		'Pragma':'no-cache',
		'Expires': 0
	});
	db.collection('fee').find().toArray(function (err, rst) {
		async.mapSeries(rst,function (item,callback) {
			console.log('item'+item.id);
			db.collection('user').findOne({id:item.id},function (err, user_rst) {
				item.name=user_rst.name;//代表名称
				item.company=user_rst.company;//单位名称
				item.phone=user_rst.phone;//纳税人联系电话
				item.nashuirenshibiehao=user_rst.nashuirenshibiehao;//纳税人识别号
				item.fapiaotaitou=user_rst.fapiaotaitou;//发票抬头
				item.nashuirendizhi=user_rst.nashuirendizhi;//纳税人地址
				callback(err,item)
			});
		},function (err,arr) {
			arr.unshift({
				name:'姓名',
				id:'身份证',
				company:'单位名称',
				phone:'纳税人联系电话',
				nashuirendizhi:'纳税人地址',
				nashuirenshibiehao:'纳税人识别号',
				fapiaotaitou:'发票抬头',
				kaipiaojine:'开票金额',
				fapiaoneirong:'发票内容'
			});
			//console.log(arr)
			var content='';
			for(var i=0,len=arr.length;i<len;i++){
				content+=arr[i]['name'];
				content+='\t';
				content+=arr[i]['id'];
				content+='\t';
				content+=arr[i]['company'];
				content+='\t';
				content+=arr[i]['phone'];
				content+='\t';
				content+=arr[i]['nashuirendizhi'];
				content+='\t';
				content+=arr[i]['nashuirenshibiehao'];
				content+='\t';
				content+=arr[i]['fapiaotaitou'];
				content+='\t';
				content+=arr[i]['kaipiaojine'];
				content+='\t';
				content+=arr[i]['fapiaoneirong'];
				content+='\t';
				content+='\t\n';
			}
			var buffer = new Buffer(content);
			//需要转换字符集
			var str=iconv.encode(buffer,'gb2312');
			res.send(str);
		});

	});
});
/**
 * zhusubiao
 */
router.route('/stay_info').post(function(req, res) {
	db.collection('stay_info').find().toArray(function (err, rst) {
		async.mapSeries(rst,function (item,callback) {
			db.collection('user').findOne({id:item.id},function (err, user_rst) {
				item.name=user_rst.name;//代表名称
				item.company=user_rst.company;//单位名称
				item.phone=user_rst.phone;//纳税人联系电话
				callback(err,item)
			});
		},function (err,arr) {
			arr.unshift({
				name:'姓名',
				id:'身份证',
				company:'单位名称',
				phone:'纳税人联系电话',
				hotel:'酒店名称',
				room:'房间号'
			});
			//console.log(arr)
			res.send(arr)
		});
	});
});
router.route('/stay_info_excel').get(function(req, res) {
	var fileName='stay_info.xls';
	res.set({
		'Content-Type': 'application/vnd.ms-execl',
		'Content-Disposition':  "attachment;filename="+encodeURIComponent(fileName) ,
		'Pragma':'no-cache',
		'Expires': 0
	});
	db.collection('stay_info').find().toArray(function (err, rst) {
		async.mapSeries(rst,function (item,callback) {
			db.collection('user').findOne({id:item.id},function (err, user_rst) {
				item.name=user_rst.name;//代表名称
				item.company=user_rst.company;//单位名称
				item.phone=user_rst.phone;//纳税人联系电话
				callback(err,item)
			});
		},function (err,arr) {
			arr.unshift({
				name:'姓名',
				id:'身份证',
				company:'单位名称',
				phone:'纳税人联系电话',
				hotel:'酒店名称',
				room:'房间号'
			});
			//console.log(arr)
			var content='';
			for(var i=0,len=arr.length;i<len;i++){
				content+=arr[i]['name'];
				content+='\t';
				content+=arr[i]['id'];
				content+='\t';
				content+=arr[i]['company'];
				content+='\t';
				content+=arr[i]['phone'];
				content+='\t';
				content+=arr[i]['hotel'];
				content+='\t';
				content+=arr[i]['room'];
				content+='\t';
				content+='\t\n';
			}
			var buffer = new Buffer(content);
			//需要转换字符集
			var str=iconv.encode(buffer,'gb2312');
			res.send(str);
		});
	});
});
/**
 * devide into groups
 */





module.exports = router;