const jwt = require('jsonwebtoken');
const User = require('../models/User')

const authenticateToken = async(req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    const authToken =  req.header('authorization');
    
    if(!authToken || !refreshToken){
        return res.status(405).json({message : " Authentication Failed : No authToken or refreshToken is provided "})
    }

    jwt.verify(authToken.replace('Bearer ', ''),process.env.JWT_SECRET_KEY||"",(err,decode)=>{
        
        if(err) {
            jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET_KEY||"",(refreshErr,refreshDecode)=> {
                if(refreshErr){
                    return res.status(401).json({message : " Authentication Failed : Both tokens are invalid"}) ;
                }
                else{
                    const newAuthToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_SECRET_KEY||"",{expiresIn : '30m'});
                    const newRefreshToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_REFRESH_SECRET_KEY||"",{expiresIn : '2h'})
                     //save auth token and referesh token in cookies
                    res.cookie('authToken',newAuthToken,{httpOnly:true}) ;
                    res.cookie('refreshToken',newRefreshToken,{httpOnly : true }) ;
                    res.header('Authorization', `Bearer ${newAuthToken}`);
                    // console.log(refreshDecode.userId,"liasd")
                    const find_user = User.findById(refreshDecode.userId);
                    if(!find_user){
                        return res.status(400).send("You are not authenticated User");
                    }else{
                        req.userId=refreshDecode.userId;
                        next();
                    }
                }
            })
        }
        else{
            const find_user = User.findById(decode.userId );
            if(!find_user){
                return res.status(400).send("You are not authenticated User");
            }else{
                req.userId=decode.userId;
                // console.log(decode.userId);
                next();
            }
   }
})

};

module.exports = authenticateToken;