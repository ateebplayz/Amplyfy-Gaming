import jwt from 'jsonwebtoken'
import express from 'express'
import { collections } from '../modules/mongo'
import dotenv from 'dotenv'
import { permissions } from '../modules/data'
dotenv.config()

const router = express.Router()

router.get('/get', (req, res) => {
    const permName = req.query.name

    let perm = 0b0000000000000000
    switch(permName) {
        case 'CLAN_CREATE':
            perm = permissions.clans.create
            break
        case 'CLAN_DELETE':
            perm = permissions.clans.delete
            break
        case 'CLAN_EDIT':
            perm = permissions.clans.edit
            break
        case 'CLAN_VIEW':
            perm = permissions.clans.view
            break
        case 'USER_CREATE':
            perm = permissions.users.create
            break
        case 'USER_DELETE':
            perm = permissions.users.delete
            break
        case 'USER_EDIT':
            perm = permissions.users.edit
            break
        case 'USER_VIEW':
            perm = permissions.users.view
            break
        case 'PRODUCT_CREATE':
            perm = permissions.products.create
            break
        case 'PRODUCT_DELETE':
            perm = permissions.products.delete
            break
        case 'PRODUCT_EDIT':
            perm = permissions.products.edit
            break
        case 'PRODUCT_VIEW':
            perm = permissions.products.view
            break
        case 'PRODUCT_KEYS':
            perm = permissions.products.keys
            break
        case 'ADMIN_CREATE':
            perm = permissions.admin.create
            break
        case 'ADMIN_DELETE':
            perm = permissions.admin.delete
            break
        case 'ADMIN_EDIT':
            perm = permissions.admin.edit
            break
    }
    if(perm == 0b0000000000000000) {
        return res.status(404).json({error: 'No Permission set found!', code: 404})
    } else {
        return res.json({data: "0b" + perm.toString(2).padStart(16, '0'), code: 200})
    }
})

export default router