require('dotenv').config();
const models = require('../models');
const bcrypt = require('bcryptjs');
const jwtUtils = require('../middlewares/auth');
const validator = require('validator')
const fs = require('fs');
const logger = require('../middlewares/winston');
const passwordValidator = require('password-validator');
const schema = new passwordValidator();
const xss = require('xss')
//const hateoasUsers = require('../HATEOAS/hateoasUsers')
schema
	.is().min(8) // Avoir 8 char au min
	.has().uppercase()//doit avoir une majuscule
	.has().lowercase()// doit avoir une minuscules
	.has().digits(1)// Au min un chiffre


exports.signup = (req, res, next) => {
	if(!validator.isEmail(req.body.email) || validator.matches(req.body.username, /[\|\/\\\*\+&#"\{\(\[\]\}\)<>$£€%=\^`]/) || validator.matches(req.body.bio, /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£€%=\^`]/)){
		logger.info('User tried to sign up with invalid email or fields containing symbols');
		return res.status(422).json({ message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^` });
	} else {
		if(schema.validate(req.body.password)) {
			let role;
			let consents = JSON.stringify({'shareable': false, 'contactable': false})
			models.Users.findAll()
				.then(users => {
					if(users.length === 0){
						role = JSON.stringify(['user', 'admin'])
						bcrypt.hash(req.body.password, 10)
							.then(hash => {
								let urlProfilePicture, altProfilePicture;
								if(req.file){
									urlProfilePicture = req.file.filename
									altProfilePicture = "Photo de profil de l'utilisateur"
								} else {
									urlProfilePicture = 'defaultPicture.png'
									altProfilePicture = "Photo de profil de l'utilisateur"
								}
								models.Users.create({
									email: xss(req.body.email),
									password: hash,
									username: xss(req.body.username),
									url_profile_picture: urlProfilePicture,
									alt_profile_picture: altProfilePicture,
									bio: xss(req.body.bio),
									role: role,
									consents: consents,
									lastLogin: 'none'
								}).then(user => {
									logger.info('First user account created');
									role = JSON.stringify(['user'])
									bcrypt.hash(`${process.env.MDP_USER_DELETED}`, 10)
										.then(hash => {
											models.Users.create({
												email: "deletedUser@admin.fr",
												password: hash,
												username: "Utilisateur supprimé",
												url_profile_picture: `deletedUser.png`,
												alt_profile_picture: altProfilePicture,
												bio: null,
												role: role,
												consents: consents,
												lastLogin: 'none'
											})
												.then(()=>{
													logger.info('Deleted user account created');
													res.status(201).json({message: `New user created ! User ID: ${user.id}`})
												}).catch(err => {
												logger.info('Something went wrong when trying to create deleted user account');
												res.status(500).json(err)
											})
										}).catch(err => {logger.info('Something went wrong with bcrypt hash for deleted user account'); res.status(500).json(err)})
								}).catch(err => {logger.info('Something went wrong when trying to create first user'); res.status(500).json(err)})
							}).catch(err => {logger.info('Something went wrong with bcrypt hash for first user'); res.status(500).json(err)})
					} else {
						role = JSON.stringify(['user'])
						models.Users.findOne({ attributes: ['email'], where: { email: req.body.email }})
							.then((user) =>{
								if(!user){
									bcrypt.hash(req.body.password, 10)
										.then(hash => {
											let urlProfilePicture, altProfilePicture;
											if(req.file){
												urlProfilePicture = req.file.filename
												altProfilePicture = "Photo de profil de l'utilisateur"
											} else {
												urlProfilePicture = `defaultPicture.png`
												altProfilePicture = "Photo de profil de l'utilisateur"
											}
											models.Users.create({
												email: xss(req.body.email),
												password: hash,
												username: xss(req.body.username),
												url_profile_picture: urlProfilePicture,
												alt_profile_picture: altProfilePicture,
												bio: xss(req.body.bio),
												role: role,
												consents: consents,
												lastLogin: 'none'
											})
												.then((newUser) => {
													logger.info('New user has been created');
													res.status(201).json({ message: `New user created ! User ID: ${newUser.id}`})
												})
												.catch((err) => {logger.info('Something went wrong when trying to create new user'); res.status(500).json(err)})

										})
										.catch(error => {logger.info(`Something went wrong with bcrypt hash (function signup)`); res.status(500).json({ error })});
								} else {
									logger.info(`An user tried to sign up with an email already in DB`)
									return res.status(401).json({message: 'This email is already in use !'})
								}
							}).catch(err => {logger.info(`Something went wrong when trying to search for all users (function signup)`); res.status(500).json(err)})
					}
				}).catch(err => {logger.info(`Something went wrong when trying to search for all users (function signup)`);res.status(500).json(err)})
		} else {
			logger.info(`An user tried to sign up with invalid password`)
			res.status(400).json({ message: `Your password must contain at least 8 characters with at least one uppercase letter and a number`})
		}
	}
}

exports.login = (req, res, next) => {
	if(!validator.isEmail(req.body.email)){
		logger.info('User tried to log in with invalid email');
		return res.status(422).json({ message: 'Invalid Email, please try with a valid one' });
	} else {
		models.Users.findOne({ where: { email: req.body.email }})
			.then((user) => {
				if(!user){
					logger.info(`An user tried to log in but couldn't be found in DB`);
					return res.status(404).json({ message: `This user couldn't be found`})
				}
				bcrypt.compare(req.body.password, user.password)
					.then(valid => {
						if (!valid) {
							logger.warn("User didn't use correct password");
							return res.status(401).json({ error: 'Wrong password !' });
						}
						logger.info('Registered user connected');
						if(user.lastLogin === '0000-00-00 00:00:00'){
							res.status(200).json({
								user_id: user.id,
								token: jwtUtils.generateToken(user)
							});
						} else {
							models.Users.update({ lastLogin: new Date() }, {where: {id: user.id}})
								.then(() => {
									res.status(200).json({
										user_id: user.id,
										token: jwtUtils.generateToken(user)
									});
								}).catch(err => res.status(500).json(err))
						}
					})
					.catch((error) => {logger.info(`${req.params.id}: Couldn't connect an user on login function`); res.status(500).json({ error })});
			})
			.catch(error => {logger.info(`${req.params.id}: Couldn't connect an user on login function`); res.status(500).json({ error })});
	}

}


exports.readOne = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	const userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to get user ${req.params.id}`);
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({ where: { id: req.params.id }, include: [models.Posts, models.Comments, models.Likes]})
			.then((users) => {
				if(!users){
					logger.info(`User ${userId} tried to get info about user ${req.params.id} but it seems this user doesn't exist`);
					res.status(404).json({ message: `User with ID ${req.params.id} not found !`})
				} else {
					let user = users
					user.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${users.url_profile_picture}`
					logger.info(`User ${userId} got info about user ${req.params.id}`);
					hateoasUsers(req, res, user, 'api/auth')
				}
			}).catch(err => {logger.info(`Something went wrong when trying to search for user ${req.params.id} info`); res.status(500).json(err)})
	}
}

exports.delete = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	const userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access delete (user) function`);
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		function deleting () {
			return new Promise((resolve) => {
				models.ReportComments.update({user_id: 2}, {where: {user_id: req.params.id}})
					.then(() => {
						models.ReportPosts.update({user_id: 2}, {where: {user_id: req.params.id}})
							.then(() => {
								models.Likes.update({user_id: 2}, {where: {user_id: req.params.id}})
									.then(() => {
										models.Comments.update({user_id: 2}, {where: {user_id: req.params.id}})
											.then(() => {
												models.Posts.update({user_id: 2}, {where: {user_id: req.params.id}})
													.then(() => resolve())
													.catch(err => res.status(500).json(err))
											}).catch(err => res.status(500).json(err))
									}).catch(err => res.status(500).json(err))
							}).catch(err => res.status(500).json(err))
					}).catch(err => res.status(500).json(err))
			})
		}
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				if(!admin){
					logger.info(`user ${userId} couldn't be found in DB`);
					res.status(400).json({message: `We couldn't authenticate user, please log in or sign up !`})
				} else {
					if(req.params.id == 2){
						res.status(400).json({message: `You can't delete this default account`})
					} else {
						models.Users.findOne({where: {id: req.params.id}})
							.then(user => {
								if(!user){
									logger.info(`User ${res.params.id} couldn't be found in DB (function delete (user))`);
									res.status(404).json({message: `User ${req.params.id} couldn't be found !`})
								} else {
									let role = JSON.parse(admin.role);
									if (user.id == req.params.id || role.includes('admin')) {
										const filename = user.url_profile_picture;
										if(!filename.includes('defaultPicture.png')) {
											fs.unlink(`images/${filename}`, () => {
												deleting()
													.then(() => {
														logger.info(`All posts/comments/likes/postsReports/commentsReports from user ${req.params.id} has been reassigned to user 2`);
														models.Users.destroy({where: {id: req.params.id}})
															.then(() => {
																logger.info(`User ${req.params.id} has been deleted`);
																res.status(200).json({message: `User ${req.params.id} deleted !`})
															})
															.catch(err => {
																logger.info(`Couldn't delete user ${req.params.id}`);
																res.status(500).json(err)
															})
													}).catch(err => {
													logger.info(`Something went wrong in function deleting (function delete (user))`);
													res.status(500).json(err)
												})
											})
										} else {
											deleting()
												.then(() => {
													models.Users.destroy({where: {id: req.params.id}})
														.then(() => {
															logger.info(`User ${req.params.id} has been deleted`);
															res.status(200).json({message: `User ${req.params.id} deleted !`})
														})
														.catch(err => {
															logger.info(`Couldn't delete user ${req.params.id}`);
															res.status(500).json(err)
														})
												}).catch(err => {
												logger.info(`Something went wrong in function deleting (function delete (user))`);
												res.status(500).json(err)
											})
										}
									} else {
										logger.info(`User ${userId} tried to delete user ${req.params.id}`);
										res.status(400).json({message: `You're not allowed for this action`})
									}
								}
							}).catch(err => {
							logger.info(`Something went wrong when trying to search user (function delete (user))`);
							res.status(500).json(err)
						})
					}
				}
			})
	}
}

exports.update = (req, res, next) => {
	let regex = /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£€%=\^`]/
	let urlProfilePicture;
	const headerAuth = req.headers['authorization'];
	const userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access updateUser function`);
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		if(req.body.email && !validator.isEmail(req.body.email)
			|| req.body.username && validator.matches(req.body.username, regex) ||
			req.body.bio && validator.matches(req.body.username, regex)) {
			res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
		} else {
			models.Users.findOne({ where: { id: req.params.id }})
				.then(user => {
					if(user.id === userId){
						let lastLogin
						if(req.body.lastLogin === ''){
							lastLogin = new Date()
							models.Users.update({lastLogin: lastLogin}, { where: { id: req.params.id }})
								.then(() => {
									res.status(200).json({message: 'User updated'})
								}).catch(err => {
								res.status(500).json(err)
							})
						} else {
							if(req.file){
								const filename = user.url_profile_picture;
								fs.unlink(`images/${filename}`, () => {
									//
								})
								urlProfilePicture = req.file.filename
							} else {
								urlProfilePicture = user.url_profile_picture;
							}
							let consents = {
								shareable: req.body.shareable,
								contactable: req.body.contactable
							};
							let password
							if(req.body.password === ''){
								password = user.password
								models.Users.update({ ...req.body, password: password, url_profile_picture: urlProfilePicture, consents: JSON.stringify(consents)}, { where: { id: req.params.id }})
									.then(() => {
										logger.info(`User ${userId} has updated his info`);
										models.Users.findOne({ where: { id: req.params.id }})
											.then(users => {
												let user = users
												user.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${user.url_profile_picture}`
												res.status(200).json({message: `Your information have been updated !`, user})
											}).catch(err=> {
											logger.info(`Something went wrong when trying to search for user in function updateUser`);
											res.status(500).json(err)
										})
									})
									.catch((err) => {
										logger.info(`Something went wrong when trying to update user ${userId}`);
										res.status(500).json(err)
									})
							} else {
								if(schema.validate(req.body.password)) {
									bcrypt.hash(req.body.password, 10)
										.then(hash => {
											password = hash
											models.Users.update({ ...req.body, password: password, url_profile_picture: urlProfilePicture, consents: JSON.stringify(consents) }, { where: { id: req.params.id }})
												.then(() => {
													logger.info(`User ${userId} has updated his info`);
													models.Users.findOne({ where: { id: req.params.id }})
														.then(users => {
															let user = users
															user.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${users.url_profile_picture}`
															res.status(200).json({message: `Your information have been updated !`, user})
														}).catch(err=> {
														logger.info(`Something went wrong when trying to search for user in function updateUser`);
														res.status(500).json(err)
													})
												})
												.catch((err) => {
													logger.info(`Something went wrong when trying to update User ${userId}`);
													res.status(500).json(err)
												})
										}).catch(err => {
										logger.info(`Something went wrong when trying to hash new password for user ${userId}`);
										res.status(500).json(err)
									})
								} else {
									logger.info(`An user tried to update his password with invalid password`)
									res.status(400).json({ message: `Your password must contain at least 8 characters with at least one uppercase letter and a number`})
								}
							}
						}
					} else {
						logger.info(`User ${userId} tried to update user ${req.params.id} infos`);
						res.status(403).json({message: `You're not allowed for this action !`})
					}
				}).catch(err=> {
				logger.info(`Something went wrong when searching for user in function updateUser`);
				res.status(500).json(err)
			})
		}
	}
}

exports.readAll = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(headerAuth){
		models.Users.findAll({
			order: [
				['username', 'ASC']
			]
		})
			.then(allUser => {
				let allUsers = allUser
				allUsers.forEach(user => {
					user.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${user.url_profile_picture}`
				})
				logger.info(`All users info has been asked`);
				hateoasUsers(req, res, allUsers, 'api/auth')
			}).catch((err) => {
			logger.info(`Something went wrong when trying to search for all users in function ReadAllUsers`);
			res.status(500).json(err)
		})
	} else {
		logger.info(`An unauthenticated user tried to get all users info`);
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	}

}

exports.updatePrivilege = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function updatePrivilege`);
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				if (!role.includes('admin')) {
					logger.info(`User ${userId} tried to access to function updatePrivilege`);
					res.status(403).json({message: `You're not allowed for this route !`})
				} else {
					models.Users.findOne({where: {id: req.params.id}})
						.then(user => {
							let roleUser = JSON.parse(user.role)
							if (roleUser.includes('admin')) {
								roleUser = ['user']
							} else {
								roleUser = ['user', 'admin'];
							}
							let newRole = JSON.stringify(roleUser)
							models.Users.update({role: newRole}, {where: {id: req.params.id}})
								.then(() => {
									logger.info(`User ${userId} has updated user ${req.params.id} privilege`);
									res.status(200).json({message: `This user's privilege has been updated to : ${roleUser} ! `})
								}).catch(err => {
								logger.info(`User ${userId} couldn't update user ${req.params.id} privilege`);
								res.status(500).json(err)
							})
						}).catch(err => {
						logger.info(`Something went wrong when trying to search for user ${userId} in function updatePrivilege`);
						res.status(500).json(err)
					})
				}
			}).catch(err => {
			logger.info(`Something went wrong when trying to search for user ${userId} in function updatePrivilege`);
			res.status(500).json(err)
		})
	}
}