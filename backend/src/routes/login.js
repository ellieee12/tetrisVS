import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import util from "node:util";

const router = express.Router();

router.post('/',async(req,res)=>{
    const {pseudo,pwd}=req.body;
    //return res.status(501).json({error:`psudo : ${pseudo} pwd ${pwd}`});
    try{
        const user = await prisma.tetris_user.findUnique({
            where:{
                pseudo:pseudo
            }
        });
        
        if (!user||user.pwd!==pwd){
            return res.status(401).json({error:'Invalid user'});
        }
        
        const payload = {user_id: user.user_id};
        const token = jwt.sign(payload,'MYSECRET',{expiresIn:'1h'});

        res.cookie('token',token,{
            httpOnly:true,
            maxAge:3600*1000 
        });
        return res.json({ user_id: user.user_id });
    }catch(err){
        console.error(
            "DB error:",
            util.inspect(err.meta?.driverAdapterError, { depth: null })
        );
        res.status(500).json({error:'Server error'});
    }
})

export default router;
