import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import util from "node:util";
import requireAuth from '../middlewares/auth.js';
import cookieParser from 'cookie-parser';

const router = express.Router();

router.use(cookieParser());

router.get('/', requireAuth, (req, res) => {
  res.json({ user_id: req.user.user_id });
});

router.delete('/', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  res.sendStatus(204);
});

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
            maxAge:3600*1000,
            secure:true,
            sameSite:'none'
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
