import 'dotenv/config'; //used to load environment variables from local .env file
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';

const connectionString = `${process.env.DATABASE_URL}`; //Reads URL from the environment
if (!connectionString) throw new Error("DATABASE_URL is not set");
//creates adapter and tells it how to connect
const adapter = new PrismaPg({connectionString});
//builds client and plugs the adapter in
//every query run through prisma goes through this adapter to Postgres
const prisma = new PrismaClient({adapter});

export default prisma;