import jwt from 'jsonwebtoken'
import express from 'express'
import { collections } from '../modules/mongo'
import dotenv from 'dotenv'
import { permissions } from '../modules/data'
import WebUser from '../schemas/webUser'
dotenv.config()
const router = express.Router()
router.use(express.json())
router.get('/fetch', async(req,res) => {
    const token = req.query.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.clans.view) {
                const users = await collections.clans.find().toArray()
                return res.json({data: users, code: 200})
            } else return res.json({error: `No permission to view this data`, code: 401})
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