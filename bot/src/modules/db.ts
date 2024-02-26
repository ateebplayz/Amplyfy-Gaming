import { zeroUser } from "./data"
import { collections } from "./mongo"
import { BotUser, Clan, Product } from "./types"

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