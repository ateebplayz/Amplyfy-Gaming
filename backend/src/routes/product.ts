import jwt from 'jsonwebtoken'
import express from 'express'
import { collections } from '../modules/mongo'
import dotenv from 'dotenv'
import WebUser from '../schemas/webUser'
import { permissions } from '../modules/data'
import Product from '../schemas/product'
import { generateRandomString } from '../modules/helpers'
dotenv.config()
function isProduct(obj: any): obj is Product {
    return (
        obj &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.description === 'string' &&
        typeof obj.price === 'number' &&
        typeof obj.stock === 'number' &&
        Array.isArray(obj.values)
    )
}
const router = express.Router()
router.use(express.json())
router.post("/create", async (req,res) => {
    const token = req.body.token
    let productObj = req.body.product
    productObj.price = parseInt(productObj.price)
    productObj.stock = parseInt(productObj.stock)
    if(!productObj || !isProduct(productObj)) {
        console.log(!productObj, !isProduct(productObj), productObj)
        return res.json({error: 'Invalid Product Name or Description Provided', code: 400})
    }
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.products.create) {
                productObj.id = generateRandomString()
                collections.products.insertOne(productObj)
                return res.json({data: `Success`, code: 200})
            } else return res.json({error: `You do not have the permission to create a product`, code: 401})
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
router.get('/fetch', async(req,res) => {
    const token = req.query.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.products.view) {
                const users = await collections.products.find().toArray()
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
router.post("/delete", async (req,res) => {
    const productId = req.body.productId
    const token = req.body.token
    if(!productId) {
        return res.json({error: 'Invalid Product ID provided', code: 400})
    }
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    } 
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.products.delete) {
                collections.products.deleteOne({id: productId})
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
router.post('/update', async(req,res) => {
    let productObj = req.body.product
    productObj.price = parseInt(productObj.price)
    productObj.stock = parseInt(productObj.stock)
    if(!productObj || !isProduct(productObj)) {
        return res.json({error: 'Invalid Product Name or Description Provided', code: 400})
    }
    const token = req.body.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    }
    if(!productObj || !isProduct(productObj)) return res.json({ error: `Invalid Product Object provided`, code: 400 })
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.products.edit) {
                const prod = await collections.products.findOne({id: productObj.id})
                if(prod)
                collections.products.updateOne({id: productObj.id}, {$set: {id: productObj.id, name: productObj.name, description: productObj.description, price: productObj.price, stock: productObj.stock, values: prod.values}})
                return res.json({data: 'Success', code: 200})
            } else return res.json({error: `No permission to update this product`, code: 401})
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
router.post('/key/add', async(req,res) => {
    const key = req.body.key
    const productId = req.body.productId
    if(!productId) {
        return res.json({error: 'Invalid Product ID Provided', code: 400})
    }
    if(!key) {
        return res.json({error: 'Invalid Key Provided', code: 400})
    }
    const token = req.body.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    }
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.products.keys) {
                let prod = await collections.products.findOne({id: productId})
                if(prod) {
                    prod.values.push(key)
                    collections.products.updateOne({id: productId}, {$set: {id: prod.id, name: prod.name, description: prod.description, price: prod.price, stock: prod.stock, values: prod.values}})
                    return res.json({data: 'Success', code: 200})
                } else return res.json({error: `The specified product key doesnt exist`, code: 404})
            } else return res.json({error: `No permission to add a key`, code: 401})
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
router.post('/key/remove', async(req,res) => {
    const key = req.body.key
    const productId = req.body.productId
    if(!productId) {
        return res.json({error: 'Invalid Product ID Provided', code: 400})
    }
    if(!key) {
        return res.json({error: 'Invalid Key Provided', code: 400})
    }
    const token = req.body.token as string
    if (!token) {
        return res.json({ error: 'Invalid token provided', code: 400});
    }
    try {
        const verified = jwt.verify(token, process.env.JWTKEY || 'abc') as WebUser
        const userDoc = await collections.web.findOne({username: verified.username, password: verified.password})
        if(userDoc) {
            if(userDoc.permissions & permissions.products.keys) {
                let prod = await collections.products.findOne({id: productId})
                if(prod) {
                    const prodVals = prod.values.filter(value => value !== key)
                    collections.products.updateOne({id: productId}, {$set: {id: prod.id, name: prod.name, description: prod.description, price: prod.price, stock: prod.stock, values: prodVals}})
                    return res.json({data: 'Success', code: 200})
                } else return res.json({error: `The specified product key doesnt exist`, code: 404})
            } else return res.json({error: `No permission to remove a key`, code: 401})
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