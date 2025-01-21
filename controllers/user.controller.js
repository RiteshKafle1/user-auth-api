const bcrypt = require("bcrypt");
const joi = require("joi");

const userModel = require("../models/user.model");
const generateToken = require("../utils/create.token");

const userCreatingSchema = joi.object({
  username: joi.string().min(5).max(20).required(),
  email: joi.string().required().email({ minDomainSegments: 2 }),
  password: joi
    .string()
    .min(8)
    .required()
    .pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
    .max(20),
});

const userLogInSchema = joi.object({
  email: joi.string().required().email({ minDomainSegments: 2 }),
  password: joi
    .string()
    .min(8)
    .required()
    .pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
    .max(20),
});
const userUpdateSchema = joi.object({
  username: joi.string().min(5).max(20).alphanum(),
});

const createUser = async (req, res) => {
  // res.set('Content-Type', 'application/json')
  // res.status(201).json({message:'hello from controllers...'})
  // .send garda res as a plane text nai janxa but .json garda json format ma res janxa..ani content type pani json hunxa
  // res.status(201).send('hello from controllers...')
  // res.status(201).json({message:'hello from controllers...'})

  const { username, email, password } = req.body;

  const { error } = userCreatingSchema.validate(req.body);

  if (error) {
    return res
      .status(401)
      .json({ error: true, message: error.details[0].message });
  }
  // console.log(username)
  // console.log(email)
  // console.log(password);
  // console.log(req.body);

  // res.status(201).json({message:'you get that'})
  // if (!username || !email || !password) {
  //   return res
  //     .status(400)
  //     .json({ error: true, message: "Fields cannot be Empty" });
  // }

  // findOne gives only one document
  const userExisted = await userModel.findOne({ email });
  
  const userNameExisted = await userModel.findOne({ username });

  if (userNameExisted) {
    return res
      .status(403)
      .json({ error: true, message: "UserName Already Exists" });
  }
  // console.log(userExisted);
  if (userExisted) {
    return res
      .status(403)
      .json({ error: true, message: "Account Already Exists" });
  }

  const salt = await bcrypt.genSalt(10);

  const hashedPass = await bcrypt.hash(password, salt);

  const newUser = new userModel({
    username,
    email,
    password: hashedPass,
  });

  try {
    await newUser.save();
    generateToken(res, newUser._id);
    return res.status(201).json({
      error: false,
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      isAdmin: newUser.isAdmin,
    });
  } catch (e) {
    console.log("Error in create user.", e);
    return res.status(401).json({ error: true, message: e.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { error } = userLogInSchema.validate(req.body);

  if (error) {
    //console.log(error);
    return res
      .status(401)
      .json({ error: true, message: error.details[0].message });
  }

  // if (!email || !password) {
  //   return res
  //     .status(400)
  //     .json({ error: true, message: "Fields cannot be Empty" });
  try {
    const userExisted = await userModel.findOne({ email });

    if (!userExisted) {
      return res
        .status(404)
        .json({ error: true, message: " OOPS !.. Couldnot found a User" });
    }

    if (userExisted) {
      const isPasswordValid = await bcrypt.compare(
        password,
        userExisted.password
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ error: true, message: "Password Incorrect." });
      }

      generateToken(res, userExisted._id);
      return res.status(200).json({
        message: "LogIn Success.",
        _id: userExisted._id,
        username: userExisted.username,
        email: userExisted.email,
        password: userExisted.password,
        isAdmin: userExisted.isAdmin,
        error: false,
      });
    }
  } catch (e) {
    console.log("Error in login", e);
    return res
      .status(401)
      .json({ error: true, message: "Couldnot Logged IN." });
  }
};

const logoutUser = async (req, res) => {
  // while clearing the cookie the attributes used when seting it should be cleared as well

  res.clearCookie("token", { httpOnly: true });
  return res.status(200).json({
    error: false,
    message: "Logged Out Successfully...",
  });
};

const getAllUser = async (req, res) => {
  try {
    const allUser = await userModel.find({});
    return res.status(200).json({ error: false, message: allUser });
  } catch (e) {
    console.log("Error in getalluser", e);
    return res
      .status(404)
      .json({ error: true, message: "Couldnot Find your request." });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    //console.log(user);

    if (user) {
      return res
        .status(200)
        .json({ username: user.username, email: user.email });
    } else {
      return res.status(404).json({ error: true, mesage: "User Not Valid." });
    }
  } catch (e) {
    return res.status(404).json({ error: true, mesage: "User Not Valid." });
  }
};

const updateCurrentProfile = async (req, res) => {
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    return res
      .status(401)
      .json({ error: true, message: error.details[0].message });
  }
  const { username } = req.body;
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    //console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User Not Valid." });
    }

    if (user.updatedAt.getDate() === new Date().getDate()) {
      return res.status(500).json({
        error: true,
        message:
          "OOPS :)Looks like you changed your name recently,it Can be Change after 24hr",
      });
    }
    user.username = username || user.username;
    const updatedUsername = await user.save();
    return res.status(200).json({ message: updatedUsername, error: false });
  } catch (e) {
    console.log("Error in updateCurrent Profile", e);
    return res.status(500).json({
      error: true,
      message: "Couldnot Update Profile.Something Went Wrong.",
    });
  }
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const User = await userModel.findById(id);
    if (User) {
      if (User.isAdmin) {
        return res
          .status(404)
          .json({ message: "OOPS Couldnot Delelte Admin", error: true });
      }
      await userModel.findByIdAndDelete(User._id);
      return res.status(200).json({ message: "User Deleted.", error: false });
    } else {
      return res
        .status(404)
        .json({ message: "Couldn't Find the user", error: true });
    }
  } catch (e) {
    console.log("Error in deleteuser", e);
    return res
      .status(404)
      .json({
        error: true,
        message: "Couldnt delete user.Something went wrong.",
      });
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const User = await userModel.findById(id).select("-password");
    // console.log(User);
    if (User) {
      return res.status(200).json({ message: User });
    } else {
      return res.status(404).json({ message: "Couldnot Find User..." });
    }
  } catch (error) {
    console.log("Error in getUserbyId", error);
    return res
      .status(404)
      .json({ error: true, message: "Couldnot found user" });
  }
};
const updateUserById=async(req,res)=>{
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    return res
      .status(401)
      .json({ error: true, message: error.details[0].message });
  }
  const {username}=req.body;
  const id=req.params.id

  try {
    const user=await userModel.findById(id).select('-password');
    if(!user){
      return res.status(404).json({error:true,message:'User Not Found.'})
    }
    if (user.updatedAt.getDate() === new Date().getDate()) {
      return res.status(500).json({
        error: true,
        message:
          "OOPS :)Looks like you changed your name recently,it Can be Change after 24hr",
      });
    }
    user.username=username || user.username;
    await user.save();
    return res.status(200).json({error:false,message:user})

    
  } catch (error) {
    console.log('Error in updateuserbyid',error);
    return res.status(404).json({error:true,message:'Updation Failed.'})
    
  }
}

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  getAllUser,
  getCurrentUserProfile,
  updateCurrentProfile,
  deleteUser,
  getUserById,
  updateUserById
};
