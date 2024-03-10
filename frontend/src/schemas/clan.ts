import BotUser from "./user"

export interface ClanUser {
    permissionLevel: number,
    user: string
}

export default interface Clan {
    clanId: string,
    name: string,
    description: string,
    leaderId: string,
    maxUser: number,
    balance: number,
    Users: Array<ClanUser>
}