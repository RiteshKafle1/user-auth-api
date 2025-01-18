const token=require('jsonwebtoken');

const generateToken=(res,userId)=>{

  const jwtToken=token.sign({userId},process.env.SECRET,{expiresIn:'5d'});
  res.cookie('token',jwtToken,{
    // js bata access hudaina docs .cookie yesari access hudaina..
    httpOnly:true,
    maxAge:5*24*60*60*1000,
    // will sent only to https connection...
    // secure:true,
  })

  return jwtToken;
}
module.exports=generateToken;