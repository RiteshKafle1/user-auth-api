const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");

const authenticate = async (req, res, next) => {

  // if validated user ho vane ta cookie ma token ta huna paryo...
  let cookietoken = req.cookies.token;
  // console.log(cookietoken);

  if (!cookietoken) {
    return res.status(400).json({message:"Not authorized,no token"});
  }

  try {
    // token create garda id deko thiye so we get that right...
    // if the token is valid-> we get that id(which is the data we used).
    // signId -> returns an object
    const signId = jwt.verify(cookietoken, process.env.SECRET);
    // console.log('sign id',signId);
    req.user = await userModel.findById(signId.userId).select(' -password');
    // console.log('requested User',req.user);
    next();
  } catch (e) {
    console.log('inside catch');
   return res.status(400).json({ error: true, message: e.message });
  }
};


const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {

    // console.log(req.user, req.user.isAdmin);
    res.status(200);
    
    next();
  } else {
    res.status(400).send("Not authorized as an Admin..");
  }
};

module.exports = { authenticate, authorizeAdmin };
