interface WebUser {
    username: string,
    password: string,
    permissions: number, // 16 bit binary 0b0000000000000000
}
export default WebUser