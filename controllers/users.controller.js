const crypto = require('crypto')

module.exports = function createUserController(db) {

    const users = db.collection('users')

    return {
        async signup( email, pseudo, password ) {
            const alreadyEmail = await users.findOne({ email: email })
            const alreadyPseudo = await users.findOne({ pseudo: pseudo })
            if (alreadyEmail || alreadyPseudo) {
                return { 
                    error: 'User already exists'
                }
            }
            const hash = crypto.createHash('sha256');
            hash.update(password);
            const lehash = hash.digest('hex')
            console.log("mdp hashé : " + lehash);

            // ne pas stocker les mot de passe en clair !
            await users.insertOne({
                email: email, pseudo: pseudo, password: lehash
            })

            return { success: true }
        },

        async login( email, password ) {
            const user = await users.findOne({ email: email })
            const hash = crypto.createHash('sha256');
            hash.update(password);
            const lehash = hash.digest('hex');
            if (!(user && user.password === lehash)) {
                return { error: 'Bad credentials' }
            }
            user.authToken = crypto.randomBytes(20).toString('hex')
            users.save(user)

            return { success: true, authToken: user.authToken, pseudo : user.pseudo }
        },

        getPseudo(token){
            return users.findOne({authToken : token}, {pseudo : 1})
        }
    }


}