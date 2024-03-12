export function getClanLevel(clanMaxUser: number): 'Igloo' | 'Iceberg' | 'Ice Fortress' | 'Ice Kingdom' {
    let returnVal: 'Igloo' | 'Iceberg' | 'Ice Fortress' | 'Ice Kingdom' = 'Igloo'
    if(clanMaxUser < 25 && clanMaxUser >= 10) returnVal = 'Igloo'
    if(clanMaxUser >= 25 && clanMaxUser < 50) returnVal = 'Iceberg'
    if(clanMaxUser >= 50 && clanMaxUser < 100) returnVal = 'Ice Fortress'
    if(clanMaxUser >= 100) returnVal = 'Ice Kingdom'
    return returnVal
}

export function getClanUpgradeAmount(clanMaxUser: number): number {
    let amount = 0
    const type = getClanLevel(clanMaxUser)
    switch (type) {
        case 'Igloo':
            amount = 1
            break
        case 'Iceberg':
            amount = 2
            break
        case 'Ice Fortress':
            amount = 3
            break
        case 'Ice Kingdom':
            amount = 4
            break
    }
    return amount
}