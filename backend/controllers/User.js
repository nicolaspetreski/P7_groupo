const bcrypt = require('bcrypt'); //hashage mdp
const jwt = require('jsonwebtoken'); // creation token
const models = require('../models'); //User model import


//INSCRIPTION USER
exports.signUpUser = (req, res, next) => {

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const photo = req.body.photo;

    //On verifie les parametres
    if (email == null || username == null || password == null) {
        return res.status(400).json({ 'error': 'missing parameters' })
    }

    //Verify pseudo lenght, mail regex, password 
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

//LOGIN USER
exports.loginUser = (req, res, next) => {
    console.log(req.body.password)
    //Look for mail address in the data base
    const email = req.body.email
    models.User.findOne({
        where: { email: email }
    })
        .then(user => {
            //If user is not in the data base
            if (!user) {
                return res.status(401).json({ error: 'User not exist in DB !' });
            }
            //If the user is in the data base
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    //If the password isn't correct
                    if (!valid) {
                        return res.status(401).json({ error: 'Invalid password !' });
                    }
                    //If the password is correct, then creation of a token
                    res.status(200).json({
                        userId: user.id,
                        isAdmin: user.isAdmin,
                        email: user.email,
                        token: jwt.sign(
                            { userId: user.id },
                            //création d'un token
                            'RANDOM_TOKEN_SECRET',
                            //valable 24h
                            { expiresIn: '24h' }
                        )
                    });
                })
                // Server error
                .catch(error => res.status(500).json({ error }));
        })
        // Server erroe
        .catch(error => res.status(500).json({ error }));
};

//DELETE USER
exports.deleteUser = (req, res, next) => {
    let id = req.body.id
    models.Post.destroy({ where: { id_users: id } })
        .then(() => models.User.destroy({ where: { id: id } }))
            .then(() => res.status(200).json({ message: 'User deleted !' }))
            .catch(error => res.status(400).json({ error }))
        .catch(error => res.status(500).json({ error }));
}


//UPDATE USER
exports.updateUser = (req, res, next) => {
    const id = req.body.id;
    const username = req.body.username;
    models.User.update(
        { username: username },
        { where: { id: id } }
    )
        .then(() => res.status(200).json({ message: 'User updated !' }))
        .catch(error => res.status(400).json({ error }));
}

//GET USER 
exports.getUser = (req, res, next) => {
    models.User.findAll()
    .then(users => res.status(200).json(users))
        .catch(error => res.status(400).json({ error }));
}