import jwt from 'jsonwebtoken'
import express from 'express'
import { collections } from '../modules/mongo'
import dotenv from 'dotenv'
import WebUser from '../schemas/webUser'
import { permissions } from '../modules/data'
dotenv.config()

const router = express.Router()
router.use(express.json())
router.use('/get', async (req, res) => {
    const username = req.query.username
    const password = req.query.password

    if(!username || !password) {
        return res.json({error: `Invalid Username Or Password`, code: 401})
    } else {
        const userDoc = await collections.web.findOne({username: username})
        if(userDoc) {
            if(userDoc.password == password) {
                const userToken = jwt.sign(userDoc, process.env.JWTKEY || 'X')
                return res.json({token: userToken, code: 200})
            } else {
                return res.json({error: `Incorrect Password`, code: 402})
            }
        } else {
            return res.json({error:`Username not found`, code: 404})
        }
    }
})
router.get('/fetch', async(req,res) => {
    const token = req.query.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.admin.create || userDoc.permissions & permissions.admin.delete || userDoc.permissions & permissions.admin.edit) {
                const users = await collections.web.find().toArray()
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
router.post("/create", async (req,res) => {
    const username = req.body.username
    const password = req.body.password
    const permissionsC = parseInt(req.body.permissions as string)
    const token = req.body.token
    if(!username || !password) {
        return res.json({error: 'Invalid Username or Password provided', code: 400})
    }
    if (isNaN(permissionsC) || !permissionsC) {
        return res.json({ error: 'Invalid permissions provided', code: 400 })
    }
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.admin.create) {
                collections.web.insertOne({username: username, password: password, permissions: permissionsC})
                return res.json({data: `Success`, code: 200})
            } else return res.json({error: `You do not have the permission to create a user`, code: 401})
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
    const username = req.body.username
    const token = req.body.token
    if(!username) {
        return res.json({error: 'Invalid Username provided', code: 400})
    }
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.admin.delete) {
                collections.web.deleteOne({username: username})
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
router.post("/update", async (req,res) => {
    const username = req.body.username
    const password = req.body.password
    const permissionsC = parseInt(req.body.permissions as string)
    const token = req.body.token
    if(!username || !password) {
        return res.json({error: 'Invalid Username or Password provided', code: 400})
    }
    if (isNaN(permissionsC) || !permissionsC) {
        return res.json({ error: 'Invalid permissions provided', code: 400 })
    }
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.admin.edit) {
                collections.web.updateOne({username: username},{$set: {username: username, password: password, permissions: permissionsC}})
                return res.json({data: `Success`, code: 200})
            } else return res.json({error: `You do not have the permission to edit a user`, code: 401})
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