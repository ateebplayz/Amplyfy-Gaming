import jwt from 'jsonwebtoken'
import express from 'express'
import { collections } from '../modules/mongo'
import dotenv from 'dotenv'
import BotUser from '../schemas/user'
import { permissions } from '../modules/data'
import WebUser from '../schemas/webUser'
dotenv.config()
function isBotUser(obj: any): obj is BotUser {
    return (
        obj &&
        typeof obj.userId === 'string' &&
        typeof obj.balance === 'object' &&
        typeof obj.balance.snowflakes === 'number' &&
        typeof obj.balance.iceCubes === 'number' &&
        typeof obj.clanId === 'string' &&
        Array.isArray(obj.items)
    )
}
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
            if(userDoc.permissions & permissions.users.view) {
                const users = await collections.users.find().toArray()
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

router.post('/update', async(req,res) => {
    let userObj = req.body.user
    userObj.balance.iceCubes = parseInt(userObj.balance.iceCubes)
    userObj.balance.snowflakes = parseInt(userObj.balance.snowflakes)
    const token = req.body.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    }
    if(!userObj || !isBotUser(userObj)) return res.json({ error: `Invalid User Object provided`, code: 400 })
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.users.edit) {
                collections.users.updateOne({userId: userObj.userId}, {$set: {userId: userObj.userId, balance: userObj.balance, clanId: userObj.clanId, items: userObj.items}})
                return res.json({data: 'Success', code: 200})
            } else return res.json({error: `No permission to update this user`, code: 401})
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
router.post("/delete", async (req,res) => {
    const userId = req.body.userId
    const token = req.body.token
    if(!userId) {
        return res.json({error: 'Invalid User ID provided', code: 400})
    }
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.users.delete) {
                collections.users.deleteOne({userId: userId})
                return res.json({data: `Success`, code: 200})
            } else return res.json({error: `You do not have the permission to delete a user`, code: 401})
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