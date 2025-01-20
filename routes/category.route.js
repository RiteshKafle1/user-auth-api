const express=require('express')
const router=express.Router()

const { authenticate, authorizeAdmin }=require('../middlewares/auth');

const {createCategory,updateCategory}=require('../controllers/category.controller')

router.route('/').post(authenticate,authorizeAdmin,createCategory)
router.route('/:categoryId').put(authenticate,authorizeAdmin,updateCategory)

module.exports=router;