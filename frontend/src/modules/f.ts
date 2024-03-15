export function getUserLevel(userPermLevel: number): 'Member' | 'Co Leader' | 'Leader' {
    let returnVal: 'Member' | 'Co Leader' | 'Leader' = 'Member'
    if(userPermLevel == 0) returnVal = 'Member'
    if(userPermLevel == 1) returnVal = 'Co Leader'
    if(userPermLevel == 3) returnVal = 'Leader'
    return returnVal
}