export const permissions = {
    clans: {
        create: 0b0000000000000001,
        delete: 0b0000000000000010,
        edit: 0b0000000000000100,
        view: 0b0000000000001000,
    },
    users: {
        create: 0b0000000000010000,
        delete: 0b0000000000100000,
        edit: 0b0000000001000000,
        view: 0b0000000010000000,
    },
    products: {
        create: 0b0000000100000000,
        delete: 0b0000001000000000,
        edit: 0b0000010000000000,
        view: 0b0000100000000000,
        keys: 0b0001000000000000,
    },
    admin: {
        create: 0b0010000000000000,
        delete: 0b0100000000000000,
        edit: 0b1000000000000000,
    },
}