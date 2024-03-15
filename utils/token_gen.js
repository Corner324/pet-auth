import jsonwebtoken from 'jsonwebtoken';

class token_gen {
    generate_token(login) {
        const data = {
            name: login,
        }

        const signature = 'MySuP3R_z3kr3t' // ALERT
        const expiration = '6h'

        return jsonwebtoken.sign({ data }, signature, { expiresIn: expiration })
    }
}
