/*
 * Created by bingpo on 2017/4/22.
 */
var mongo = require('mongoskin');
var db = mongo.db('mongodb://root:fuckshit@115.159.43.13:27017/manage_sys?authSource=admin');
module.exports.db = db;