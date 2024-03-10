import { BotUser } from "./types"

export const zeroUser = (userId: string): BotUser => {
    const user: BotUser = {
        userId: userId,
        balance: {
            snowflakes: 0,
            iceCubes: 0
        },
        clanId: "",
        items: []
    }
    return user
}

/*
    Below is data used in configuration. Above is data used for Databases and values that should never be changed.
*/

export const AMPLYFY_LOGO_URL = 'https://images-ext-2.discordapp.net/external/xUPTLOwyTLz3xzcATdcADsiyuK4Or3wAQuQf4rDRU_k/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1186395097386983505/639c0020e392b07d7f18877a3d7b2b83.png?format=webp&quality=lossless&width=497&height=497'
export const AMPLYFY_LOGO_COLOR = 0x6488ea
export const roleIds = {
    moderator: '1186419332071297105',
    developer: '1186419332071297105',
    vip: '1186419332071297105',
    premium: '1186419332071297105',
}
export const emojis = {
    ice_cube: '🧊',
    snowflake: '❄️',
    igloo: '<:igloo:1210689130669932544>',
    iceburg: '<:iceberg:1210689355975368755>',
    kingdom: '🏰',
    cosmetics: '📝'
}
export const prices = {
    iceCube: 10
}
export const channelIds ={
    logChannel: '1211070510083870790'
}
export const guildId = '1186395097386983505'