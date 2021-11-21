require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");

const checkAuth = require('../middleware/check-auth');
const app = require('../../app');

// const User = require('../models/user');
// const { route } = require('./products');
// const { db } = require('../models/order');

console.log(process.env.DB_HOST)
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });

con.connect((err) => {
    if (err){
        console.log(err);
        console.log('error in connection')
    }
    else{
        console.log("Connected!");
    }
    
});


exports.get_user_data = function(req, res) {
    const query = "select email,fullname from users order by id desc";
    con.query(query, (err, result) => {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                message: 'No user found!'
            });
        }
    })
};