/**
 * Created by hfcj3 on 2017/7/6.
 */
var express = require('express');
var db = require('../db').db;
var async = require('async');
var iconv = require('iconv-lite');
//var xlsx = require('node-xlsx');
var xlsx = require('xlsx');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var router = express.Router();

/**
 * zhusufapiaobiao
 */
router.route('/stay_fee_info_excel').get(function(req, res){
	var fileName='stay_fee_info.csv';
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
				content+=',';
				content+=arr[i]['id'];
				content+='\t,';
				content+=arr[i]['company'];
				content+=',';
				content+=arr[i]['phone'];
				content+='\t,';
				content+=arr[i]['nashuirendizhi'];
				content+=',';
				content+=arr[i]['nashuirenshibiehao'];
				content+='\t,';
				content+=arr[i]['fapiaotaitou'];
				content+=',';
				content+=arr[i]['kaipiaojine'];
				content+=',';
				content+=arr[i]['fapiaoneirong'];
				content+=',';
				content+='\n';
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
	var fileName='fee_info.csv';
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
				content+=',';
				content+=arr[i]['id'];
				content+='\t,';
				content+=arr[i]['company'];
				content+=',';
				content+=arr[i]['phone'];
				content+='\t,';
				content+=arr[i]['nashuirendizhi'];
				content+=',';
				content+=arr[i]['nashuirenshibiehao'];
				content+='\t,';
				content+=arr[i]['fapiaotaitou'];
				content+=',';
				content+=arr[i]['kaipiaojine'];
				content+=',';
				content+=arr[i]['fapiaoneirong'];
				content+=',';
				content+='\n';
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
	var fileName='stay_info.csv';
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
				content+=',';
				content+=arr[i]['id'];
				content+='\t,';
				content+=arr[i]['company'];
				content+=',';
				content+=arr[i]['phone'];
				content+='\t,';
				content+=arr[i]['hotel'];
				content+=',';
				content+=arr[i]['room'];
				content+=',';
				content+='\n';
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
/**
 * upload xlsx
 */
router.route('/import_user').post(multipartMiddleware,function(req, res) {
	// 获得文件的临时路径
	//console.log(req.files);
	var tmp_path = req.files.file.path;

	var newname = 'user.xlsx';
	// 指定文件上传后的目录
	var target_path = './public/' + newname;
	// 移动文件
	fs.rename(tmp_path, target_path, function(err) {
		if (err) throw err;
		// 删除临时文件夹文件,
		fs.unlink(tmp_path, function() {
			if (err) throw err;
		});
	});
	//var rst = xlsx.parse('./public/user.xlsx');
	var rst = xlsx.readFile('./public/user.xlsx');
	var sheetNames = rst.SheetNames;
	var worksheet = rst.Sheets[sheetNames[0]];
	var toJson = xlsx.utils.sheet_to_json(worksheet);
	try {
		async.map(toJson,function (item,callback) {
			if(item['身份证号/军官证号']!==''&&item['身份证号/军官证号']){
				db.collection('user').findOne({id:item['身份证号/军官证号']},function(err, rst) {
					//console.log('rst:'+rst);
					if(!rst){
						//console.log('item'+item['身份证号/军官证号']);
						var obj = {
							id:item['身份证号/军官证号'],
							name:item['姓名'] || '',
							gender:item['性别'] || '',
							phone:item['移动电话'] || '',
							career:item['类型'] || '',
							province:item['省份'] || '',
							email:item['E-mail'] || '',
							company:item['工作单位'] || '',
							fapiaotaitou:item['发票抬头'] || '',
							nashuirendizhi:item['纳税人地址'] || '',
							qiandaozhuangtai:item['签到状态'] || '',
							nashuirendianhua:item['纳税人电话'] || '',
							nashuirenshibiehao:item['纳税人识别号'] || '',
							comment:item['备注'] || ''
						};
						db.collection('user').insertOne(obj)
					}
				});
				callback()
			}

		});
		res.send('导入成功')
	}catch(e){
		res.send('导入发生错误')
	}


});
router.post('/', function(req, res, next) {
});

router.get('/test1',function(req, res) {
	var rst = xlsx.readFile('./public/user.xlsx');
	var sheetNames = rst.SheetNames;
	var worksheet = rst.Sheets[sheetNames[0]];
	var toJson = xlsx.utils.sheet_to_json(worksheet);

});

module.exports = router;