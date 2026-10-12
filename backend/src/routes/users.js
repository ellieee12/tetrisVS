import express from 'express';
import jwt from 'jsonwebtoken'; 
import prisma from '../db/prisma.js';
import pick from '../utils/pick.js'
import requireAuth from '../middlewares/auth.js';
import cookieParser from 'cookie-parser';

const router = express.Router();
router.use(cookieParser());
router.use(requireAuth);

const ALLOWED_FIELDS = ['pseudo','pwd','nb_played_games','nb_win','best_score']

router.get('/',async (req, res)=>{
    try{
        const users = await prisma.tetris_user.findMany({
            omit:{pwd:true}
        })
        return res.json(users);
    }catch(err){
        console.log(err);
        return res.status(500).json({error:'Failed to fetch users'});
    }
})

router.post('/',async(req,res)=>{
    const required = ["pseudo","pwd"];
    const missing = required.filter((key)=>!req.body?.[key]);
    if (missing.length>0){
        return res.status(400).json({error:`Missing fields: ${missing.join(", ")}`});
    }
    try{
        const user = await prisma.tetris_user.create({
            data:{
                pseudo:req.body.pseudo,
                pwd:req.body.pwd,
                nb_played_games:0,
                nb_win:0,
                best_score:0
            }
        });
        return res.status(201).json({pseudo:user.pseudo});
    }catch(err){
        console.log(err);
        console.log(req.body.pseudo)
        return res.status(500).json({error:'Failed to create user.'});
    }
})

router.get('/:id',async(req,res)=>{
    const id = Number(req.params.id)
    if(!Number.isInteger(id)){
        return res.status(400).json({error:'Invalid user id'})
    }
    try{
        const user = await prisma.tetris_user.findUnique({
            where:{
                user_id: id
            },
            omit:{pwd:true}
        });
        console.log(user)
        res.send(user); 
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Failed to fetch users'});
    }
})

router.patch('/:id',async(req,res)=>{
    const id = Number(req.params.id)
    if(!Number.isInteger(id)){
        return res.status(400).json({error:'Invalid user id'})
    }
    try{
        const data = pick(req.body,ALLOWED_FIELDS)
        if (Object.keys(data).length===0){
            return res.status(400).json({error:'No valid fields to update user.'})
        }
        const user = await prisma.tetris_user.update({
            where : {user_id : id},
            omit:{pwd:true} ,
            data
        })
        res.status(200).json(user);
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Unable to update user."})
    }
})

router.put('/:id',async(req,res)=>{
    const id = Number(req.params.id)
    if(!Number.isInteger(id)){
        return res.status(400).json({error:'Invalid user id'})
    }
    const missing = ALLOWED_FIELDS.filter((key)=>!req.body?.[key]=== undefined || req.body?.[key] === null);
    if (missing.length>0){
        return res.status(400).json({error:`Missing fields: ${missing.join(", ")}`});
    }
    
    try{
        const user = await prisma.tetris_user.update({
            where : {user_id : id},
            omit:{pwd:true} ,
            data:{
                pseudo:req.body.pseudo,
                pwd:req.body.pwd,
                nb_played_games:req.body.nb_played_games,
                nb_win:req.body.nb_win,
                best_score:req.body.best_score
            }
        })
        res.status(200).json(user);
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Unable to update user."})
    }
})

router.delete('/:id',async (req,res)=>{
    const id = Number(req.params.id)
    if(!Number.isInteger(id)){
        return res.status(400).json({error:'Invalid user id'})
    }
    try{
        const user = await prisma.tetris_user.delete({
            where:{
                user_id:id
            }
        })
        res.status(200).json({message:`User ${id} deleted.`})
    }catch(err){
        console.log(err);
        res.status(500).json({error:`Unable to delete user ${id}.`})
    }
})

router.options('/',(req,res)=>{
    res.set('Allow','GET, POST, OPTIONS');
    return res.sendStatus(204);
})

router.options('/:id',(req,res)=>{
    res.set('Allow','GET, POST, PUT, PATCH, DELETE, OPTIONS');
    return res.sendStatus(204);
})
export default router;