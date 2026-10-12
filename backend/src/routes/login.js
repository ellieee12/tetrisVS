import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js'
const router = express.Router();
router.get('/',async(req,res)=>{
    const {pseudo,pwd}=req.body;
    try{
        const user = await prisma.tetris_user.findUnique({
            where:{
                pseudo:pseudo
            }
        });
        if (!user||user.pwd!==pwd){
            return res.status(401).json({error:'Invalid credentials'});
        }
        const payload = {user_id:55};
        const token = jwt.sign(payload,'MYSECRET',{expiresIn:'1h'});

        res.cookie('token',token,{
            httpOnly:true, //only accessible via HTTP req
            maxAge:3600*1000 //cookie expiration time (1h)
        });
        res.send('Logged in successfully!')
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Server error'});
    }
})

export default router;