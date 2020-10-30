const Router = require('express').Router
const createUserController = require('./controllers/users.controller')
const createPasteController = require('./controllers/pastes.controller')


async function createRouter(db) {
    const router = Router()
    const UserController = createUserController(db)
    const PasteController = createPasteController(db)

    async function isAuth(req, res, next) {
        console.log('isAuth is called now')
        if (req.headers['authorization']) {
            const token = req.headers['authorization']
            console.log('token is', token)
            const result = await db.collection('users').findOne({ authToken: token })
            if (result) {
                req.isAuth = true
                req.authUser = result
            }
        }

        next();
    }

    /* Ceci est le block de code a dupliquer pour continuer l'app */
    router.get('/', async function(req, res) {
        const listOfPastes = await PasteController.retrievePastes();

        const getCookie = req.cookies;
        //const test = PasteController.getNiceDate(listOfPastes);
        let pseudoBis = undefined;
        const newListOfPastes = PasteController.getNiceDate(listOfPastes);
        if (getCookie.authToken) {
            const user = await UserController.getPseudo(getCookie.authToken);
            console.log('user : ' + user)
            if (user != null) {
                pseudoBis = user.pseudo;
                console.log('pseudobis : ' + pseudoBis)
            }
        }
        return res.render('index.twig', { listOfPastes : newListOfPastes, pseudo : pseudoBis })
    })
    
    router.post('/', async function(req, res) {
        const loginResult = await UserController.login(req.body.email, req.body.password)
        if (loginResult.error){
            return res.render('loginpage.twig', { error : loginResult.error })
        }
        res.cookie('authToken', loginResult.authToken);
        // //const getCookie = req.cookies;
        // let pseudoBis = undefined

        // if (loginResult.authToken) {
        //     console.log('token : ' + loginResult.authToken);
        //     const user = await UserController.getPseudo(loginResult.authToken);
        //     if (user != null) {
        //         pseudoBis = user.pseudo;
        //     }
        // }
        const listOfPastes = await PasteController.retrievePastes();
        const newListOfPastes = PasteController.getNiceDate(listOfPastes);
        //console.log('login : ' + pseudoBis);
        return res.render('index.twig', { listOfPastes : newListOfPastes, pseudo : loginResult.pseudo })
    })

    router.get('/signup', async function(req, res) {
        //const signupResult = await UserController.signup(req.body)
        return res.render('signuppage.twig', { signup : true })
        //return res.json(signupResult)
    })

    router.post('/signup', async function(req, res) {
        const response = req.body;
        const resultSignup = await UserController.signup(response.email, response.pseudo, response.password);
        
        if (resultSignup.error){
            return res.render('signuppage.twig', { 
                error : resultSignup.error, 
                mail : resultSignup.mail.email, 
                pseudo : resultSignup.pseudo.pseudo})
        }
        return res.render('loginpage.twig', { mail : response.email, login : true })
    })

    router.get('/loginpage', async function(req, res) {
        return res.render('loginpage.twig', { login : true })
    })

    router.get('/my-pastes', isAuth, async function (req, res) {
        console.log('test mypastes : ' + req.isAuth)
        // if (!req.isAuth) {
        //     return res.status(401).end();
        // }
        const getCookie = req.cookies;
        console.log(getCookie.authToken);
        if (getCookie.authToken) {
            const pseudo = await UserController.getPseudo(getCookie.authToken);
            const mypastes = await db.collection('pastes').find({ 'owner': pseudo.pseudo }, 'title url createdAt').toArray()
            console.log('mypastes : ' + mypastes)
            return res.render('mypastes.twig', { mypastes : mypastes, pseudo : pseudo.pseudo });
        }
        else {
            return res.status(401).end();
        }
        
        // return res.json({
        //     list: mypastes,
        //     isAuth: req.isAuth,
        // })
    })

    router.get('/paste/:slug', isAuth, async function (req, res) {
        console.log("myslug : " + req.params.slug)
        const paste = await PasteController.retrieveOnePaste(req.params.slug)
        console.log("the paste : " + paste);

        const getCookie = req.cookies;
        console.log(getCookie.authToken);
        if (getCookie.authToken) {
            var pseudo = await UserController.getPseudo(getCookie.authToken);
            pseudo = pseudo.pseudo;
        }
        else {
            const pseudo = "anonymous"
        }
        return res.render('paste.twig', { data : paste,  pseudo : pseudo })
    })

    router.post('/pasteSent', async function(req, res){
        console.log(req.body)
        const anonymousMode = req.body.anonymousMode;
        console.log('chechbox : ' + anonymousMode);
        if (anonymousMode){
            var pseudo = "anonymous"
        }
        else {
            const getCookie = req.cookies;
            console.log(getCookie.authToken);
            if (getCookie.authToken) {
                var pseudo = await UserController.getPseudo(getCookie.authToken);
                pseudo = pseudo.pseudo;
            }
            else {
                var pseudo = "anonymous"
            }
        }
        
        await PasteController.insertPaste(req.body.title, req.body.content, pseudo);
        //const listOfPastes = await PasteController.retrievePastes();
        //return res.json({ test : listOfPastes })
        //return res.render('index.twig', { listOfPastes : listOfPastes })
        return res.redirect('/')
    }),

    router.get('/disconnect', async function(req, res){
        res.clearCookie('authToken');
        return res.redirect('/');
    })
    
    return router
}

module.exports = createRouter