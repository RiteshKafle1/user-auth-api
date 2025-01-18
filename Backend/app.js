// Global Module
const express=require('express');
const app=express();
require('dotenv').config();
const cookieParser = require('cookie-parser');


// connectdb
const connectDB=require('../DB/db');
const userrouter=require('../routes/user.route')
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

app.use('/api/users',userrouter)


//  server port
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
  console.log('Server is Running !:)');
})