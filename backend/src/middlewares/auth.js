import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

function requireAuth(req,res,next){
    try{
        console.log(req.cookies)
        const token = req.cookies?.token;
        if (!token){
            res.status(401).json({
                error:'Missing token'
            });
        }else{
            const payload = jwt.verify(token,'MYSECRET'); //TODO:replace MYSECRET
            req.user = payload;
            next();
        }
    }catch(err){
        console.log(err);
        res.status(401).json({
            error:'Invalid token'
        });
    }
}

export default requireAuth;