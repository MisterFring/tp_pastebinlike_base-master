const crypto = require('crypto')
const date_fns = require('date-fns')
//Math = require('mathjs')

module.exports = function createUserController(db) {

    const pastes = db.collection('pastes')

    return {

        async insertPaste(title, content, owner) {
            const insertOne = await pastes.insertOne({ 
                title : title, 
                content : content, 
                createdAt : new Date(),
                url : Math.round(new Date().getTime() / 1000),
                owner : owner
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
        },

        // correctDigits(time) {
        //     return ("0" + time).slice(-2);
        // }, 

        getNiceDate(arrayOfPastes){
        
            for (const item of arrayOfPastes) {
                item.createdAt = date_fns.format((item.createdAt), "yyyy-MM-dd HH:mm:ss")
            }
            return arrayOfPastes
                // arrayOfPastes.forEach(element => {
                //     var myDate = element.createdAt;
                //     var year = myDate.getFullYear();
                //     var month = myDate.getMonth();
                //     var day = myDate.getDate();
                //     var hour = myDate.getHours();
                //     var min = myDate.getMinutes();
                //     var sec = myDate.getSeconds();
                //     element.createdAt =  year + " / " + month + " / " + day + " - " + hour + ":" + min + ":" + sec;
                // });
        }
    }


}