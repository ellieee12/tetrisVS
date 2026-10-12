import express from 'express';
import users from './routes/users.js';
import login from './routes/login.js';
const app = express();
app.use(express.json());
app.use("/users/",users);
app.use("/login/",login);

app.listen(3000,()=>{
    console.log('Listening on port 3000');
})