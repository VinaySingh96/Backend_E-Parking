const express = require('express');
const router = express.Router(); // for various endpoints

const bcrypt = require('bcrypt'); // to secure password

const user = require('../models/Users'); // to store user with given schema
const ParkingLots = require('../models/ParkingLot');

const { body, validationResult } = require('express-validator'); //to validate body of req so that it contains required fields

var jwt = require('jsonwebtoken'); // generate access token authontication for various works using access
const fetchUser = require('../middleware/fetchUser'); // middleware so that when we have access token and we directly get user info i.e id directly by only calling it

let JWT_SECRET = "Smart Parking management -- Project"; // can be any string so that any user can't guess this


// Route 1: create a user using POST : /api/auth (doesn't require auth)
router.post('/createUser', [
  body('name', "User name can not be blank").isLength({ min: 1 }),
  body('email', "Enter a valid email id").isEmail(),
  body('password', "Password must be at least 1 characters").isLength({ min: 1 })
], async (req, res) => {
  try {
    console.log("Creating a new user with details : ",req.body);
    // to protect the password and save the hashed pass(not meaningfull by looking) to db
    const salt = await bcrypt.genSalt();
    const hashedpass = await bcrypt.hash(req.body.password, salt);

    const errors = validationResult(req);

    // if there are some errors in body of req
    if (!errors.isEmpty()) {
      console.log(errors);
      res.send(errors.array());
      return;
    }

    // check weather user with the email already exist
    var User = await user.findOne({ email: req.body.email });
    // if user is already present
    if (User != null) {
      return res.status(403).send({"Error" : "User for this email already exists"});
    }

    //appropriate way to create user and save to mongo db 
    User=await user.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedpass
    });
    console.log("hey")
    // using id to create access token 
    const data = {
      user: {
        id: User._id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    // console.log(User);
    res.json({ name:req.body.name,authToken });
  }
  catch (err) {
    res.status(500).send(err);
  }

})


// Route 2: for login using POST: /api/auth/login
router.post('/login', [
  body('email', "Enter a valid Email").isEmail()
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty())
    return res.status(400).json({ errors: err.array() });
  const { email, password } = req.body;
  try {
    if(email=='admin@gmail.com' && password=='admin'){
      const allParkingLots = await ParkingLots.find({IsApproved:false});
      return res.status(200).json({"Admin":"Admin","allParkingLots":allParkingLots});
    }
    const vuser = await user.findOne({ email });
    if (vuser == null)
      return res.status(400).json({ 'error': 'wrong credentials' });

    let pass = await bcrypt.compare(password, vuser.password);
    if (!pass)
      return res.status(400).json({ 'error': 'wrong credentials' });
    // console.log(vuser._id);
    const data = {
      user: {
        id: vuser._id
      }
    }
    console.log("Login with user id : ",vuser.id);
    let name=vuser.name;
    const allParkingLots = await ParkingLots.find({user:vuser._id,IsApproved:true});
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ name,authToken,allParkingLots });

  } catch (error) {
    console.error(error.message);
    res.send("Some Error occured");
  }
})

// Route 3: To display user's Data
router.post('/getUser', fetchUser, async (req, res) => {
  try {
    userId = req.user.id;
    // console.log(userId);
    const usern = await user.findById(userId).select("-password");
    // console.log('Got user');
    res.json(usern)
  } catch (error) {
    console.error(error.message);
    res.send("Internal Server error");
  }

})

module.exports = router;