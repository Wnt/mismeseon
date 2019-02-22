var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var storedLocation = {lat: 60.44336866986641, lng: 22.24981378949923};

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.render('index.ejs', {storedLocation: storedLocation});
});
app.post('/save', function(req, res) {
    res.json({result: "OK"});
    storedLocation = req.body;
});

module.exports = app;
