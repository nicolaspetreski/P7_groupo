const bcrypt = require('bcrypt'); //hashage mdp
const jwt = require('jsonwebtoken'); // creation token
const models = require('../models'); //User model import


//Inscription de l'utilisateur
exports.UserSignup = (req, res, next) => {

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const photo = req.body.photo;

    //On verifie les parametres suivants
    if (email == null || username == null || password == null) {
        return res.status(400).json({ 'error': 'missing parameters' })
    }

    //Verification du mail regex et mot de passe
    models.User.findOne({
        attributes: ['email'],
        where: { email: email }
    })
        .then(function (userFound) {
            if (!userFound) {
                bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                    const newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        photo: photo,
                        isAdmin: 0
                    })
                        .then(function (newUser) {
                            return res.status(201).json({
                                'userId': newUser.id
                            })
                        })
                        .catch(function (err) {
                            return res.status(500).json({ 'error': 'cannot add user' });
                        })
                })
            } else {
                return res.status(409).json({ 'error': 'user already exist' });
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
        })
}

//Connexion de l'utilisateur
exports.UserLogin = (req, res, next) => {
    console.log(req.body.password)
    const email = req.body.email // Verifie l'addresse mail dans la DB
    models.User.findOne({
        where: { email: email }
    })
        .then(user => {
            //Si l'utilisateur n'est pas dans la DB
            if (!user) {
                return res.status(401).json({ error: 'User not exist in DB !' });
            }
            //Si l'utilisateur est dans la DB
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    //Si le mdp est incorrect
                    if (!valid) {
                        return res.status(401).json({ error: 'Invalid password !' });
                    }
                    //Si le mdp est correcte alors creation de token
                    res.status(200).json({
                        userId: user.id,
                        isAdmin: user.isAdmin,
                        email: user.email,
                        token: jwt.sign(
                            { userId: user.id },
                            //création d'un token ici
                            'RANDOM_TOKEN_SECRET',
                            //Valable 24h
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

//Pour supprimer un utilisateur
exports.UserDelete = (req, res, next) => {
    let id = req.body.id
    models.Post.destroy({ where: { id_users: id } })
        .then(() => models.User.destroy({ where: { id: id } }))
            .then(() => res.status(200).json({ message: 'User deleted !' }))
            .catch(error => res.status(400).json({ error }))
        .catch(error => res.status(500).json({ error }));
}

//Obtention de l'utilisateur
exports.UserGet = (req, res, next) => {
    models.User.findAll()
    .then(users => res.status(200).json(users))
        .catch(error => res.status(400).json({ error }));
}

//Mise a jour de l'utilisateur
exports.UserUpdate = (req, res, next) => {
    const id = req.body.id;
    const username = req.body.username;
    models.User.update(
        { username: username },
        { where: { id: id } }
    )
        .then(() => res.status(200).json({ message: 'User updated !' }))
        .catch(error => res.status(400).json({ error }));
}
