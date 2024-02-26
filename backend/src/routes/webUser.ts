import jwt from 'jsonwebtoken'
import express from 'express'
import { collections } from '../modules/mongo'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

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

export default router