import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { BotUser, Clan, Invite, Product } from './types'
dotenv.config()

export const mongoClient = new MongoClient(process.env.MONGOURI || '')

const db = mongoClient.db('Amplyfy')

export const collections = {
    users: db.collection<BotUser>('Users'),
    products: db.collection<Product>('Products'),
    clans: db.collection<Clan>('Clans'),
    invites: db.collection<Invite>('Invites')
}