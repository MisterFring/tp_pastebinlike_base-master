crypto = require('crypto')

module.exports = function createUserController(db) {

    const pastes = db.collection('pastes')

    return {
        async signup({ email, pseudo, password }) {
            const alreadyEmail = await users.findOne({ email: email })
            const alreadyPseudo = await users.findOne({ pseudo: pseudo })
            if (alreadyEmail || alreadyPseudo) {
                return { error: 'User already exists' }
            }

        },

        async insertPaste(title, content) {
            const insertOne = await pastes.insertOne({ title : title, content : content})
            return { success : true }
        },

        retrievePastes() {
            return pastes.find({}, { title : 1}).toArray();
        }
    }


}