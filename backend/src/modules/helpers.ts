import { permissions } from "./data"

export function permissionCheck(type: 'clans' | 'users' | 'products' | 'admin', flag: 'create' | 'delete' | 'edit' | 'view' | 'keys', value: number)
{
    let permission = false
    switch(type) {
        case 'clans':
            if(flag == 'create' && value & permissions.clans.create) permission = true
            if(flag == 'delete' && value & permissions.clans.delete) permission = true
            if(flag == 'edit' && value & permissions.clans.edit) permission = true
            if(flag == 'view' && value & permissions.clans.view) permission = true
            break
        case 'users':
            if(flag == 'create' && value & permissions.users.create) permission = true
            if(flag == 'delete' && value & permissions.users.delete) permission = true
            if(flag == 'edit' && value & permissions.users.edit) permission = true
            if(flag == 'view' && value & permissions.users.view) permission = true
            break
        case 'products':
            if(flag == 'create' && value & permissions.products.create) permission = true
            if(flag == 'delete' && value & permissions.products.delete) permission = true
            if(flag == 'edit' && value & permissions.products.edit) permission = true
            if(flag == 'view' && value & permissions.products.view) permission = true
            if(flag == 'keys' && value & permissions.products.keys) permission = true
            break
        case 'admin':
            if(flag == 'create' && value & permissions.admin.create) permission = true
            if(flag == 'delete' && value & permissions.admin.delete) permission = true
            if(flag == 'edit' && value & permissions.admin.edit) permission = true
            break
    }
    return permission
}
export function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const digits = '1234567890'

    function randomChar(charSet: string) {
        return charSet.charAt(Math.floor(Math.random() * charSet.length))
    }

    let str = ''
    for (let i = 0; i < 2; i++) {
        str += randomChar(characters)
    }
    str += '-'
    for (let i = 0; i < 3; i++) {
        str += randomChar(characters + digits)
    }
    str += '-'
    for (let i = 0; i < 3; i++) {
        str += randomChar(digits)
    }
    return str
}