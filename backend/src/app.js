import express from 'express';
import users from './routes/users.js';
import login from './routes/login.js';
import { createServer } from "node:http";
import { createWsRelayServer } from "@trystero-p2p/ws-relay/server";
const app = express();
app.use(express.json());
app.use("/users/",users);
app.use("/login/",login);

const server = createServer(app);
const relay = createWsRelayServer({
    server,
    path: "/relay"
});

await relay.ready;

server.listen(3000, () => {
    console.log("Express + Trystero WS relay running");
    console.log('Listening on port 3000');
    const u = new URL(process.env.DATABASE_URL);
    console.log("DB host:", u.hostname, "port:", u.port);
});

export default app