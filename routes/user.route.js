const express=require('express');
const router=express.Router();

const {createUser,loginUser,logoutUser,getAllUser,getCurrentUserProfile,updateCurrentProfile,deleteUser,getUserById}=require('../controllers/user.controller')

const {authenticate,authorizeAdmin}=require('../middlewares/auth')

router.route('/')
.post(createUser)
// direct home page ma jana khojiraxa..so..token wouldnot be validated...
.get(authenticate,authorizeAdmin,getAllUser)

router.route('/auth').post(loginUser)

router.post('/logout',logoutUser);

router.route('/profile')
.get(authenticate,getCurrentUserProfile)
.put(authenticate,updateCurrentProfile);

router.route('/:id')
.delete(authenticate,authorizeAdmin,deleteUser)
.get(authenticate,authorizeAdmin,getUserById);





module.exports=router;