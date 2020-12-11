const express = require('express');
const postRouter = express.Router(); // methode routeur

const auth = require('../middleware/auth'); //besoin d' authentification

const postCtrl = require('../controllers/post'); //controlleurs de post

//Routes
postRouter.get('/',auth, postCtrl.getAllPost);
postRouter.post('/',auth, postCtrl.addPost);
postRouter.delete('/',auth,  postCtrl.deletePost);


module.exports = postRouter;