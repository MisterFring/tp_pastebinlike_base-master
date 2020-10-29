crypto = require('crypto')
//Math = require('mathjs')

module.exports = function createUserController(db) {

    const pastes = db.collection('pastes')

    return {

        async insertPaste(title, content) {
            const insertOne = await pastes.insertOne({ 
                title : title, 
                content : content, 
                createdAt : new Date(),
                url : Math.round(new Date().getTime() / 1000)
            })
            return { success : true }
        },

        // const collection_pastes = [
        //     {
        //         "_id": ObjectId(),
        //         "title": "My #1 Paste",
        //         "slug": "239847", // OU "url_id": "093284",
        //         "exposure": "public/unlisted",
        //         "content": "The FAT content",
        //         "createdAt": "",
        //         "show_owner": true/false,
        //         "owner": {
        //             type: 'anonymous/user',
        //             id: 'null/user_id'
        //         }
        //     }
        // ]

        retrievePastes() {
            return pastes.find({}, { title : 1}).sort({createdAt : -1}).limit(10).toArray();
        },

        retrieveOnePaste(url) {
            return pastes.findOne({ url : parseInt(url) });
        }
    }


}