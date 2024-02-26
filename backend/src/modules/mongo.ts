import { MongoClient } from "mongodb";
import dotenv from 'dotenv'
import WebUser from "../schemas/webUser";
import Clan from "../schemas/clan";
import Product from "../schemas/product";
import BotUser from "../schemas/user";
dotenv.config()

export const mongoClient = new MongoClient(process.env.MONGOURI || '')

const db = mongoClient.db('Amplyfy')

export const collections = {
    users: db.collection<BotUser>('Users'),
    products: db.collection<Product>('Products'),
    clans: db.collection<Clan>('Clans'),
    web: db.collection<WebUser>('WebUser'),
}