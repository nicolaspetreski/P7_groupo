const models = require('../models');
const logger = require('../middlewares/winston');
const validator = require('validator');
const xss = require('xss')



exports.research = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function Research`)
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		if(req.body.research === '' || req.body.research === null) {
			logger.info(`an user tried to use function Research without filling field`)
			res.status(400).json({ message: `Please complete the field before clicking on the search button`})
		} else {
			let regex = /[\|\/\\\*\+&#"\{\(\[\]\}\)<>$£€%=\^]/
			if(validator.matches(req.body.research, regex)){
				res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
			} else {
				let username = xss(req.body.research).toUpperCase()
				models.Users.findAll()
					.then(user => {
						if(user.length === 0){
							user = 'There is no user with this username'
							logger.info(`User research didn't match any username`)
							res.status(200).json(user)
						} else {
							let users = user
							users.forEach(user => {
								user.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${user.url_profile_picture}`
							})
							let usersCorresponding = []
							for(let i in users){
								if(users[i].username.toUpperCase().includes(username)){
									usersCorresponding.push(users[i])
								}
								if(i == users.length -1){
									logger.info(`User got all user which usernames are matching with his research`)
									res.status(200).json(usersCorresponding)
								}
							}
						}
					}).catch(err => {
					logger.info(`Something went wrong when trying to find all users in function research`)
					res.status(500).json(err)
				})
			}
		}
	}
}