const mongoose=require('mongoose');

const connectDb=async (URI)=>{
  try{

    await mongoose.connect(process.env.URI||'');
    console.log('Connected to DB :)');
   }
  catch(e){
    console.log(e.message);

  }
}
module.exports=connectDb;