import { APIEmbedField, ChannelType, PermissionsBitField } from "discord.js"
import { client } from ".."
import { guildId, zeroUser } from "./data"
import { InfoEmbed } from "./embed"
import { collections } from "./mongo"
import { BotUser, Clan, ClanUser, Product } from "./types"
import dotenv from 'dotenv'
dotenv.config()

export async function fetchUser(userId:string): Promise<BotUser> {
    let user
    try {
        user = await collections.users.findOne({userId: userId})
        if(!user) {
            await collections.users.insertOne(zeroUser(userId))
            user = await collections.users.findOne({userId: userId})    
        }
    } catch {console.log}
    return user as BotUser
}
export async function fetchClan(clanId: string): Promise<Clan | null> {
    let clan: Clan | null
    try {
        clan = await collections.clans.findOne({clanId: clanId})
        if(!clan) clan = null
        return clan
    } catch {console.log}
    return null
}
export async function fetchProducts(): Promise<Array<Product>> {
    let products: Array<Product>
    try {
        products = await collections.products.find().toArray()
        return products
    } catch {console.log}
    products = []
    return products
}
export async function updateUser(user:BotUser) {
    try {
        await collections.users.updateOne(
            {
                userId: user.userId,
            },
            {
                $set: user
            }
        )
    } catch {console.log}
}
export async function addBalance(userId: string, type: 'snowflake' | 'ice', amount: number) {
    try {
        let user = await fetchUser(userId)
        switch (type) {
            case 'snowflake':
                user.balance.snowflakes = user.balance.snowflakes + amount
                await updateUser(user)
                break
            case 'ice':
                user.balance.iceCubes = user.balance.iceCubes + amount
                await updateUser(user)
                break
        }
    } catch {console.log}
}
export async function reduceBalance(userId: string, type: 'snowflake' | 'ice', amount: number) {
    try {
        let user = await fetchUser(userId)
        switch (type) {
            case 'snowflake':
                user.balance.snowflakes = user.balance.snowflakes - amount
                await updateUser(user)
                break
            case 'ice':
                user.balance.iceCubes = user.balance.iceCubes - amount
                await updateUser(user)
                break
        }
    } catch {console.log}
}
export async function purchaseProduct(userId: string, product: Product) {
    await reduceBalance(userId, 'snowflake', product.price)
    let productNonCons = await collections.products.findOne({id: product.id})
    if(productNonCons) {
        let user = await fetchUser(userId)
        if(user) {
            const key = productNonCons.values.pop()
            user.items.push({
                time: Date.now(),
                product: product,
                value: key,
            })
            productNonCons.stock = productNonCons.stock - 1
            collections.users.updateOne({userId: userId}, {$set: user})
            collections.products.updateOne({id: product.id}, {$set: productNonCons})
            const member = await (await client.guilds.fetch(process.env.GUILDID || '')).members.fetch(userId)
            if(member) {
                try {
                    const embed = new InfoEmbed(`Purchase Successful`, `Below is the key of the item **${product.name}**. You can also view this anytime using the /purchases command.`).addFields({name: 'Key', value: `||${key}||`} as APIEmbedField)
                    member.send({embeds: [embed]})
                } catch {}
            } 
        }
    }
    return
}
export async function createClan(userId: string, name: string, description: string) {
    reduceBalance(userId, 'ice', 10)
    const guild = await client.guilds.fetch(guildId)
    const role = await guild.roles.create({name: name + ' Member'})
    const leaderRole = await guild.roles.create({name: name + ' Leader'})
    await guild.roles.create({name: name + ' Co-Leader'})
    const category = await guild.channels.create({
        name: name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: role.id,
                allow: [PermissionsBitField.Flags.ViewChannel]
            }
        ]
    })
    await guild.channels.create({
        name: 'Talking',
        type: ChannelType.GuildVoice,
        parent: category.id
    })
    await guild.channels.create({
        name: 'Talking #2',
        type: ChannelType.GuildVoice,
        parent: category.id
    })
    await guild.channels.create({
        name: 'Chatting',
        type: ChannelType.GuildText,
        parent: category.id
    })
    let user = await fetchUser(userId)
    let users: Array<ClanUser> = [
        {
            permissionLevel: 3,
            user: userId
        }
    ]
    collections.clans.insertOne({
        Users: users,
        leaderId: userId,
        clanId: category.id,
        name: name,
        description: description,
        maxUser: 10,
        balance: 0
    })
    try {
        (await guild.members.fetch(userId)).roles.add(role);
        (await guild.members.fetch(userId)).roles.add(leaderRole)
    } catch {console.log}
    user.clanId = category.id
    collections.users.updateOne({userId: userId}, {$set: user})
}
export async function existClan(type: 'id' | 'name', value: string): Promise<boolean> {
    let found = false
    switch(type) {
        case 'id':
            let clan = await collections.clans.findOne({clanId: value})
            if(clan) found = true
            break
        case 'name':
            let clan2 = await collections.clans.findOne({
                name: { $regex: new RegExp(value, 'i') }
            })
            if (clan2) found = true
            break
    }
    return found
}