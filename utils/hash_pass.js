const argon2 = require('argon2')

class HashPass {
    async hashing(password) {
        const passwordHashed = await argon2.hash(password)
        return passwordHashed
    }
    async check_pass(hash, password) {
        const correctPassword = await argon2.verify(hash, password)
        return correctPassword
    }
}

module.exports = { HashPass }
