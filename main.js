const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require("mongoose");
const express = require('express');
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(express.static(__dirname + '/public'));
app.use(session({
secret: 'there in not place like home',
resave: false,
saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
    email: String,
    password: String
  });
userSchema.plugin(passportLocalMongoose);

// database set up ////////////////////////////////////////////////
mongoose.connect('mongodb://localhost:27017/dbName', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
///////////////////////////////////////////////////////////////


app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
  });

app.route('/')
    .get(function (req, res) {
        res.render('home');
    })
    .post(function (req, res){
        console.log('post was send');
    });

app.route("/login")
    .get(function (req, res) {
        res.render('login');
    })
    .post(function (req, res) {
        const user = new User({
        username: req.body.username,
        passport: req.body.password,
        });
        req.login(user, function (err) {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, function () {
            res.redirect('loginArea');;
            })
        }
        })
    });

app.route('/register')
    .get(function (req, res) {
        const RegisterOpen = true;
        if (RegisterOpen) {
        res.render('register');
        } else {
        if (req.isAuthenticated()) {
            res.render('Register')
        } else {
            res.redirect('login');
        }
        }
    })
    .post(function (req, res) {
        User.register({
        username: req.body.username
        }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function () {
            res.redirect('loginArea');
            });
        }
        });
    });

  app.route('/logout')
    .get(function (req, res) {
    req.logOut();
    res.redirect('/');
  });

  app.route('/loginArea')
    .get((req, res)=> {res.render('loginArea')})