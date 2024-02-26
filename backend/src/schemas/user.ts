import Purchase from "./purchase";

export default interface BotUser {
    userId: string,
    balance: {
        snowflakes: number,
        iceCubes: number
    },
    clanId: string,
    items: Array<Purchase>,
}