import express from 'express';
import jwt from 'jsonwebtoken'; 
const router = express.Router();

const users=[
    {id:'123',nb_wins:5,nb_games:7},
    {id:'321',nb_wins:6,nb_games:10}
];

router.get('/',(req, res)=>{
    //TODO : Implement prisma select
    return res.json(users);
})

router.post('/',(req,res)=>{
    const required = ["id","pwd"];
    const missing = required.filter((key)=>!req.body?.[key]);
    if (missing.length>0){
        return res.status(400).json({error:`Missing fields: ${missing.join(", ")}`});
    }
    try{
        //TODO : Implement prisma add 
        return res.status(201).json();
    }catch(err){
        console.log(err);
        return res.status(500).json({error:'Failed to create user.'});
    }
})
export default router;