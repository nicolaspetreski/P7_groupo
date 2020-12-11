const express = require('express');
const userRouter = express.Router();// Routeur methode

const userCtrl = require('../controllers/user');//User controlleur

const auth = require('../middleware/auth');//Authentification

//Routes
userRouter.post('/signup',  userCtrl.UserSignup);
userRouter.post('/login', userCtrl.UserLogin);
userRouter.delete('/:id',auth, userCtrl.UserDelete);
userRouter.get('/',auth, userCtrl.UserGet);
userRouter.put('/:id',auth, userCtrl.UserUpdate);


module.exports = userRouter;