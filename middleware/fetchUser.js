var jwt=require('jsonwebtoken');
let JWT_SECRET = "Smart Parking management -- Project";

// takes access token from the header and provide the corresponding userid
const fetchUser=(req,res,next)=>{
    const access_token=req.header('auth-token');
    console.log(access_token);

    // if no access token in req
    if(!access_token)
    {
        return res.status(401).send({Error:"No Token"});
    }
    try{ 
        // verifing so that we get the data
        const data=jwt.verify(access_token, JWT_SECRET);
        console.log(data);
        req.user=data.user;
        // the async(req,res) function after fetchUser runs when we call next();
        next();
    } catch(error){
        // if access token is invalid
        res.status(401).send({Error:"Please authonticate using a valid token"});
    }
}

module.exports=fetchUser;