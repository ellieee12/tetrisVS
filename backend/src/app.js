import express from 'express';
import users from './routes/users.js';
import login from './routes/login.js';
import cors from 'cors';
const app = express();

// app.use(cors({ origin: 'https://tetrisvs-api.vercel.app/', credentials: true }));
app.use(cors({
  origin: ['https://tetrisvs-bice.vercel.app', 'http://localhost:5173/'],
  credentials: true
}));

app.use(express.json());
app.use("/users/",users);
app.use("/login/",login);

app.listen(3000,()=>{
    console.log('Listening on port 3000');
    const u = new URL(process.env.DATABASE_URL);
    console.log("DB host:", u.hostname, "port:", u.port);
})

export default app
