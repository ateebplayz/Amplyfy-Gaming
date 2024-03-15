import { APIEmbedField, ChannelType, PermissionsBitField, basename } from "discord.js"
import { client } from ".."
import { generateUniqueKey, guildId, zeroUser } from "./data"
import { InfoEmbed } from "./embed"
import { collections } from "./mongo"
import { BotUser, Clan, ClanUser, Product } from "./types"
import dotenv from 'dotenv'
import { getClanUpgradeAmount } from "./f"
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
export async function addUserToClan(userId: string, clanId: string) {
    let clan = await fetchClan(clanId)
    let user = await fetchUser(userId)
    if(clan && user) {
        clan.Users.push({
            permissionLevel: 0,
            user: userId
        })
        const guild = await client.guilds.fetch(guildId)
        const role = guild.roles.cache.find(role => role.name == `${clan?.name} Member`)
        if(role) {
            (await guild.members.fetch(userId)).roles.add(role)
        }
        user.clanId = clan.clanId
        collections.clans.updateOne({clanId: clanId}, {$set: clan})
        collections.users.updateOne({userId: userId}, {$set: user})
    }
}
export async function removeUserFromClan(userId: string, clanId: string) {
    let clan = await fetchClan(clanId)
    let user = await fetchUser(userId)
    if(clan && user) {
        const index = clan.Users.findIndex(item => item.user === userId)
        let clanUser = clan.Users[index]
        if(index !== -1)
        clan.Users.splice(index, 1)
        const guild = await client.guilds.fetch(guildId)
        const role = guild.roles.cache.find(role => role.name == `${clan?.name} Member`)
        if(role) {
            (await guild.members.fetch(userId)).roles.remove(role)
        }
        if(clanUser.permissionLevel = 1) {
            const role = guild.roles.cache.find(role => role.name == `${clan?.name} Co-Leader`)
            if(role) {
                (await guild.members.fetch(userId)).roles.remove(role)
            }
        }
        user.clanId = ''
        collections.clans.updateOne({clanId: clanId}, {$set: clan})
        collections.users.updateOne({userId: userId}, {$set: user})
    }
}
export async function deleteClan(clanId:string) {
    const clan = await fetchClan(clanId)
    if(clan) 
    {
        const guild = await client.guilds.fetch(guildId)
        clan.Users.map(async (user) => {
            let userT = await fetchUser(user.user)
            userT.clanId = ''
            collections.users.updateOne({userId: user.user}, {$set: userT})
        })
        const role1 = guild.roles.cache.find(role => role.name == `${clan?.name} Member`)
        const role2 = guild.roles.cache.find(role => role.name == `${clan?.name} Co-Leader`)
        const role3 = guild.roles.cache.find(role => role.name == `${clan?.name} Leader`)
        if(role1) role1.delete()
        if(role2) role2.delete()
        if(role3) role3.delete()
        
        const category = await guild.channels.fetch(clan.clanId)
        if(category && category.type == ChannelType.GuildCategory)
        {
            category.children.cache.forEach(channel => {
                channel.deletable ? channel.delete() : console.log('Tried to delete channel failure.')
            })
            if(category.deletable) category.delete()
        }
        collections.clans.deleteOne({clanId: clanId})
    }
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
        name: 'Chatting',
        type: ChannelType.GuildText,
        parent: category.id
    })
    await guild.channels.create({
        name: 'Talking #1',
        type: ChannelType.GuildVoice,
        parent: category.id
    })
    await guild.channels.create({
        name: 'Talking #2',
        type: ChannelType.GuildVoice,
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
export async function getName(value: string, type: 'clan') {
    let returnVal = 'None Found'
    switch(type) {
        case 'clan':
            let clan = await collections.clans.findOne({clanId: value})
            if(clan) return returnVal = clan.name
            break
    }
    return returnVal
}
export async function depositClan(amount: number, userId: string) {
    const user = await fetchUser(userId)
    if(user) {
        reduceBalance(userId, "ice", amount)
        collections.clans.updateOne({
            clanId: user.clanId
        },
        {
            $inc: {
                balance: amount,
            }
        })
    }
    return
}
export async function updateClanDetails(clanId: string, desc: string) {
    console.log(1)
    let clan = await fetchClan(clanId)
    if(clan) {
        clan.description = desc
        collections.clans.updateOne({
            clanId: clanId
        }, {
            $set: clan
        })
    }
    return
}
export function inviteUserToClan(clanId: string, userId: string): string {
    let key = generateUniqueKey()
    collections.invites.insertOne({
        clanId: clanId,
        userId: userId,
        invite: key,
        date: Date.now()
    })
    return key
}
export async function useKey(key: string, userId: string): Promise<{used: boolean, clanId: string}> {
    let used = false
    const invite = await collections.invites.findOne({invite: key})
    if(invite && invite.userId == userId && (Date.now() - invite.date <= 172000000)) {
        collections.invites.deleteOne({invite: key})
        used = true
    }
    return {used: used, clanId: invite?.clanId || ''}
}
export async function handlePermissionChange(perm: 'member' | 'coleader', userId: string, clanId: string) {
    let clan = await fetchClan(clanId)
    if(clan) {
        const index = clan.Users.findIndex(item => item.user === userId)
        const guild = await client.guilds.fetch(guildId)
        // const roleMember = guild.roles.cache.find(role => role.name == `${clan?.name} Member`)
        const roleCL = guild.roles.cache.find(role => role.name == `${clan?.name} Co-Leader`)
        const member = await guild.members.fetch(userId)
        switch(perm) {
            case 'member':
                if(clan.Users[index].permissionLevel == 1) {
                    clan.Users[index].permissionLevel = 0
                    if(roleCL)
                    member.roles.remove(roleCL)
                    collections.clans.updateOne({clanId: clan.clanId}, {$set: clan})
                }
                break
            case 'coleader':
                if(clan.Users[index].permissionLevel == 0) {
                    clan.Users[index].permissionLevel = 1
                    if(roleCL)
                    member.roles.add(roleCL)
                    collections.clans.updateOne({clanId: clan.clanId}, {$set: clan})
                }
                break
        }
    }
}

export async function upgradeClan(amount: number, clan: Clan): Promise<boolean> {
    let newLevelAchieved = false
    collections.clans.updateOne(
        {
            clanId: clan.clanId,
        },
        {
            $inc: {
                maxUser: amount
            }
        }
    )
    collections.clans.updateOne({
        clanId: clan.clanId,
    }, {
        $inc: {
            balance: getClanUpgradeAmount(clan.maxUser) * -1
        }
    })
    const newClanMaxUser = amount + clan.maxUser
    const guild = await client.guilds.fetch(guildId)
    const category = await guild.channels.fetch(clan.clanId)
    if(category && category.type == ChannelType.GuildCategory)
    {
        if(newClanMaxUser == 25) { // Assuming amount's are credited in only Fives.
            await guild.channels.create({
                name: 'Talking #3',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #4',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #5',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Chat Thread',
                type: ChannelType.GuildForum,
                parent: category.id
            })
            const leaderRole = guild.roles.cache.find(role => role.name == `${clan.name} Co-Leader`)
            const coLeaderRole = guild.roles.cache.find(role => role.name == `${clan.name} Leader`)
            if(leaderRole && coLeaderRole) {
                await guild.channels.create({
                    name: 'Leadership Channel',
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: leaderRole.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: coLeaderRole.id,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                })
            }
            newLevelAchieved = true
        } 
        if(newClanMaxUser == 50) {
            await guild.channels.create({
                name: 'Talking #6',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #7',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #8',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #9',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #10',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            newLevelAchieved = true
        }
        if(newClanMaxUser == 100) {
            await guild.channels.create({
                name: 'Talking #11',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #12',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #13',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #14',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            await guild.channels.create({
                name: 'Talking #15',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            newLevelAchieved = true
        }
    }
    return newLevelAchieved
}
export async function getTopClans(): Promise<Clan[]> {
    try {
        const topClans: Clan[] = await collections.clans
            .find({})
            .sort({ "balance": -1 })
            .limit(10)
            .toArray()

        return topClans
    } catch (error) {
        console.log('Error retrieving top clans:', error)
        return []
    }
}
