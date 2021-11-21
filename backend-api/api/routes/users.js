require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var user_controller = require('../controllers/userController');

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

router.post('/signup', (req, res, next) => {
    const user = req.body;

    if(!user) {
        return res.status(200).json({
            status: 401,
            message: "OOPS! Something is wrong."
        })
    }
    console.log(user.email)
    const query = "select email from users where email = '"+ user.email +"'";

    con.query(query, (err, result) => {
        console.log(result[0])
       if(!result[0]) {
           console.log(user.email)
            bcrypt.hash(user.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const verificationCode = randomstring.generate();
                    const values = [user.email, user.fullName, user.role,hash,user.verified,verificationCode];

                    var sql = "INSERT INTO users (email, fullName, role, password, verified, verificationCode) VALUES (?)";

                    con.query(sql, [values], function (err, result) {
                        if (err) throw err;
                        return res.status(200).json({
                            status: 'success',
                            message: "User created successfully",
                            data: result
                          });
                        });
                }

            });
        }else{
            return res.status(200).json({
                status: 'success',
                message: "Sorry! this email id is already exists.",
                data: result
            });
        }
    });
});

router.get('/save', (req, res) => {
    res.json({'status': "hey man do it!"})
});

router.get('/getuserdata', user_controller.get_user_data);

router.post('/login', (req, res, next) => {
    const user = req.body;

    if(!user) {
        return res.status(200).json({
            status: 401,
            message: "OOPS! Something is wrong."
        })
    }
    const query = "select id,email,password from users where email = '"+ user.email +"'";
    console.log(query)
    con.query(query, (err, result) => {
    //    console.log(result[0])
       if(result[0]) {
        //    console.log(user.email)
           bcrypt.compare(user.password, result[0].password, (err, ans) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }

                else if (ans) {
                    const token = jwt.sign({
                        exp: Math.floor(Date.now().valueOf() / 1000) + (60 * 60 * 24),
                        email: result[0].email,
                        userId: result[0].id
                    }, process.env.SECRET);
                    return res.status(200).json({
                        message: 'Auth Success',
                        token: token
                    });
                } else {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }
            });
        }else{
            res.status(500).json({
                error: err
            });
        }
    });
});

router.post('/userDetails', checkAuth, (req, res, next) => {
    console.log(req.userData);

    const email = req.userData.email;
    if(!req.userData) {
        return res.status(200).json({
            status: 401,
            message: "OOPS! Something is wrong."
        })
    }
    const query = "select id,fullname,role,email,password from users where email = '"+ req.userData.email +"'";

    con.query(query, (err, result) => {
        console.log(result)
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({
                    message: 'No user found!'
                });
            }

        })
});

router.get('/logout',checkAuth, (req, res, next) => {
    const token = jwt.sign({
        exp: "",
        email: "",
        userId:""
      });

    console.log(token)

        return res.status(200).json({
            message: "User logout successfully!"
        })
})

module.exports = router;