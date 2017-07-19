var express = require('express');
var router = express.Router();
var db = require('../db').db;

/* GET users listing. */
router.post('/', function(req, res, next) {
    db.collection('user').findOne({id:req.body.id},function(err, rst) {
        console.log(err,rst)
    })
    res.send('respond with a resource');
});

module.exports = router;
