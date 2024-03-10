import jwt from 'jsonwebtoken'
import express from 'express'
import { collections } from '../modules/mongo'
import dotenv from 'dotenv'
import BotUser from '../schemas/user'
import { permissions } from '../modules/data'
import WebUser from '../schemas/webUser'
dotenv.config()

const router = express.Router()

router.get('/get', async(req,res) => {
    const token = req.query.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            let stats = {
                products: -1,
                users: -1,
                clans: -1,
                keys: -1,
                administrators: -1,
            }
            if(userDoc.permissions & permissions.products.view) stats.products = (await collections.products.find().toArray()).length
            if(userDoc.permissions & permissions.users.view) stats.users = (await collections.users.find().toArray()).length
            if(userDoc.permissions & permissions.clans.view) stats.clans = (await collections.clans.find().toArray()).length
            if(userDoc.permissions & permissions.products.keys) {
                const products = await collections.products.find().toArray()
                let totalKeyAmount = 0
                products.map((product) => {
                    totalKeyAmount += product.stock
                })
                stats.keys = totalKeyAmount
            }
            if(userDoc.permissions & permissions.admin.edit || userDoc.permissions & permissions.admin.create || userDoc.permissions & permissions.admin.delete) stats.administrators = (await collections.web.find().toArray()).length
            return res.json({data: stats, code: 200})
        } else {
            return res.json({error:`Incorrect Username Or Password`, code: 400})
        }
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return res.json({ error: 'Invalid token format', code: 400 })
        }
        console.error(error)
        return res.json({ error: 'Internal Server Error', code:500 })
    }
})

export default router