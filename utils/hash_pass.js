import argon2 from 'argon2';

export default class HashPass {
    async hashing(password) {
        return await argon2.hash(password)
    }
    async check_pass(hash, password) {
        return await argon2.verify(hash, password)
    }
}

