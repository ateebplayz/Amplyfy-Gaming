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
router.get('/name', (req, res) =>{
    let perm = parseInt(req.query.perm as string)
    let permissionNames = []
    if(perm & permissions.clans.create) permissionNames.push('Create Clans')
    if(perm & permissions.clans.delete) permissionNames.push('Delete Clans')
    if(perm & permissions.clans.edit) permissionNames.push('Edit Clans')
    if(perm & permissions.clans.view) permissionNames.push('View Clans')
    if(perm & permissions.users.create) permissionNames.push('Create Users')
    if(perm & permissions.users.delete) permissionNames.push('Delete Users')
    if(perm & permissions.users.edit) permissionNames.push('Edit Users')
    if(perm & permissions.users.view) permissionNames.push('View Users')
    if(perm & permissions.products.create) permissionNames.push('Create Products')
    if(perm & permissions.products.delete) permissionNames.push('Delete Products')
    if(perm & permissions.products.edit) permissionNames.push('Edit Products')
    if(perm & permissions.products.view) permissionNames.push('View Products')
    if(perm & permissions.products.keys) permissionNames.push('Manage Product Keys')
    if(perm & permissions.admin.create) permissionNames.push('Create Admins')
    if(perm & permissions.admin.delete) permissionNames.push('Delete Admins')
    if(perm & permissions.admin.edit) permissionNames.push('Edit Admins')
    return res.json({data: permissionNames, code:200})
})

router.get('/fetch', async (req, res) => {
    const permissionsT = [
        {
            name: 'Create Clans',
            value: permissions.clans.create
        },
        {
            name: 'Delete Clans',
            value: permissions.clans.delete
        },
        {
            name: 'Edit Clans',
            value: permissions.clans.edit
        },
        {
            name: 'View Clans',
            value: permissions.clans.view
        },
        {
            name: 'Create Users',
            value: permissions.users.create
        },
        {
            name: 'Delete Users',
            value: permissions.users.delete
        },
        {
            name: 'Edit Users',
            value: permissions.users.edit
        },
        {
            name: 'View Users',
            value: permissions.users.view
        },
        {
            name: 'Create Products',
            value: permissions.products.create
        },
        {
            name: 'Delete Products',
            value: permissions.products.delete
        },
        {
            name: 'Edit Products',
            value: permissions.products.edit
        },
        {
            name: 'View Products',
            value: permissions.products.view
        },
        {
            name: 'Manage Product Keys',
            value: permissions.products.keys
        },
        {
            name: 'Create Admins',
            value: permissions.admin.create
        },
        {
            name: 'Delete Admins',
            value: permissions.admin.delete
        },
        {
            name: 'Edit Admins',
            value: permissions.admin.edit
        },
    ]
    return res.json({data: permissionsT, code: 200})
})
export default router