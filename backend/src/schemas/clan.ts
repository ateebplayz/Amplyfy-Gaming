import BotUser from "./user"

export interface ClanUser {
    permissionLevel: number,
    user: BotUser
}

export default interface Clan {
    clanId: string,
    name: string,
    description: string,
    maxUser: number,
    balance: number,
    Users: Array<ClanUser>
}