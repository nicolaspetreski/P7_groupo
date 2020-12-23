require('dotenv').config();
const models = require('../models');
const jwtUtils = require('../middlewares/auth');
const logger = require('../middlewares/winston');
const validator = require('validator');
const xss = require('xss')
//const hateoasIssue = require('../HATEOAS/hateoasIssue')


exports.create = (req, res, next) => {
	if(validator.matches(req.body.lastName, /[\|\/\\\*\+&#"\{\(\[\]\}\)<>$£€%=\^`0-9]/) || validator.matches(req.body.firstName, /[\|\/\\\*\+&#"\{\(\[\]\}\)<>$£€%=\^`0-9]/) ) {
		return res.status(422).json({ message: `Last name and first name must contain only letters, spaces, hyphens or apostrophe`})
	} else if (validator.matches(req.body.issue, /[\|\/\\\*\+&#"\{\(\[\]\}\)<>$£€%=\^`]/)) {
		return res.status(422).json({ message: `Issue must not contain |/*+&#{[]})<>$£€%=^`})
	} else if (!validator.isEmail(req.body.email)){
		return res.status(422).json({ message: `Email must be a valid email`})
	} else {
		let body = req.body
		body.lastName = xss(req.body.lastName)
		body.firstName = xss(req.body.firstName)
		body.email = xss(req.body.email)
		body.issue = xss(req.body.issue)
		models.IssuesUsers.create({
			...body,
			status: 'pending'
		})
			.then(issue => {
				logger.info('An user has created a new issue')
				res.status(201).json(issue)
			})
			.catch(err => {
				logger.info('Something went wrong when an user tried to create an issue')
				res.status(500).json(err)
			})
	}
}


exports.update = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	const userId = jwtUtils.getUserId(headerAuth);
	models.Users.findOne({ where: {id: userId}})
		.then(user => {
			if (!user) {
				logger.info('An unauthenticated user tried to access to updateIssue function')
				res.status(400).json({message: `We couldn't authenticate you, please log in or sign up !`})
			} else {
				let roles = JSON.parse(user.role)
				if (!roles.includes('admin')) {
					logger.info(`User ${userId} tried to access to updateIssue function`)
					res.status(403).json({message: `You're not allowed to access this route`})
				} else {
					models.IssuesUsers.update({status: 'treated'}, {where: {id: req.params.id}})
						.then(() => {
							logger.info(`UserIssue ${req.params.id} has been updated`)
							res.status(200).json({ message: `User Issue updated`})
						})
						.catch(err => {
							logger.info(`Something went wrong when trying to update UserIssue ${req.params.id}`)
							res.status(500).json(err)
						})
				}
			}
		}).catch(err => {
			logger.info(`Something went wrong when trying to search for user ${userId} in function updateIssue`)
		res.status(500).json(err)
	})
}


exports.readAll = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	const userId = jwtUtils.getUserId(headerAuth);
	models.Users.findOne({ where: {id: userId}})
		.then(user => {
			if (!user) {
				logger.info('Un unauthenticated user tried to access to function readAllIssue')
				res.status(404).json({message: `We couldn't authenticate you, please log in or sign up !`})
			} else {
				let roles = JSON.parse(user.role)
				if (!roles.includes('admin')) {
					logger.info(`User ${userId} tried to access to function readAllIssues`)
					res.status(403).json({message: `You're not allowed to access this route`})
				} else {
					models.IssuesUsers.findAll()
						.then(issue => {
							logger.info(`User ${userId} got all user issues`)
							let issues = hateoasIssues(req, issue, 'api/issue')
							res.status(200).json(issues)
						}).catch(err => {
							logger.info(`Something went wrong when trying to get all user issues`)
						res.status(500).json(err)
					})
				}
			}
		}).catch(err => {
			logger.info(`Something went wrong when trying to find user ${userId} in function ReadAllIssues`)
		res.status(500).json(err)
	})
}


exports.readAllPending = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info('An unauthenticated user tried to access to function readAllPendingIssues')
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				if (!role.includes('admin')) {
					logger.info(`User ${userId} tried to access to function readAllPendingIssues`)
					res.status(403).json({message: `You're not allowed for this route !`})
				} else {
					models.IssuesUsers.findAll({where: {status: 'pending'}}, {
						order: [
							['id', 'DESC']
						]
					})
						.then(issues => {
							if(issues.length === 0){
								logger.info(`User ${userId} got all issues with status 'pending' - here zero`)
								res.status(200).json({ message: `There is no user issue with status 'pending' !`})
							} else {
								logger.info(`User ${userId} got all issues with status 'pending'`)
								res.status(200).json(issues)
							}
						}).catch(err => {
						logger.info(`Something went wrong when trying to search for all issues with status 'pending'`)
						res.status(500).json(err)
					})
				}
			}).catch(err => {
			logger.info(`Something went wrong when trying to find a user in function readAllPendingIssues`)
			res.status(500).json(err)
		})
	}
}

exports.delete = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function deleteIssue`)
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				if (!role.includes('admin')) {
					logger.info(`User ${userId} tried to access to function deleteIssue`)
					res.status(403).json({message: `You're not allowed for this route !`})
				} else {
					models.IssuesUsers.destroy({where: {id: req.params.id}})
						.then(() => {
							logger.info(`User ${userId} has deleted userIssue ${req.params.id}`)
							res.status(200).json({ message: `The user issue has been deleted !`})
						}).catch(err => {
						logger.info(`Something went wrong when trying to delete an user issue`)
						res.status(500).json(err)
					})
				}
			}).catch(err => {
			logger.info(`Something went wrong when trying to find user in function deleteIssue`)
			res.status(500).json(err)
		})
	}
}


exports.readMessageWaiting = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to readMessageWaiting function`)
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				if (!role.includes('admin')) {
					logger.info(`User ${userId} tried to access to readMessageWaiting function`)
					res.status(403).json({message: `You're not allowed for this route !`})
				} else {
					models.IssuesUsers.findAll({where: {status: 'pending'}}, {
						order: [
							['id', 'DESC']
						]
					}).then(issues => {
						models.ReportPosts.findAll({where: {status: 'pending'}}, {
							order: [
								['id', 'DESC']
							]
						})
							.then(postReports => {
								models.ReportComments.findAll({where: {status: 'pending'}}, {
									order: [
										['id', 'DESC']
									]
								})
									.then(commentReports => {
										let total = issues.length + postReports.length + commentReports.length
										logger.info(`User ${userId} got all waiting messages`)
										res.status(200).json({issues, postReports, commentReports, total})
									})
									.catch(err => {
										logger.info(`Something went wrong when trying to get all commentsReports with status 'pending' in function readMessageWaiting`)
										res.status(500).json(err)
									})
							}).catch(err => {
							logger.info(`Something went wrong when trying to get all postsReports with status 'pending' in function readMessageWaiting`)
							res.status(500).json(err)
						})
					}).catch(err =>{
						logger.info(`Something went wrong when trying to get all userIssues with status 'pending' in function readMessageWaiting`)
						res.status(500).json(err)
					})
				}
			}).catch(err => {
			logger.info(`Something went wrong when trying to find user in function readMessageWaiting`)
			res.status(500).json(err)
		})
	}
}