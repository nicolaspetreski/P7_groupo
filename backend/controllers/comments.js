require('dotenv').config();
const models = require('../models');
const jwtUtils = require('../middlewares/auth');
const logger = require('../middlewares/winston');
const validator = require('validator');

const xss = require('xss')


exports.create = (req, res, next) => {
	let regex = /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£€%=\^`]/
	const headerAuth = req.headers['authorization'];
	const userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth) {
		logger.info(`an unauthenticated user tried to create a comment`)
		res.status(400).json({message: `You're not authenticated, please log in!`})
	} else {
		if(req.body.comment === null) {
			res.status(400).json({message: 'Comment is required'})
		} else if (validator.matches(req.body.comment, regex)){
			res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
		} else {
			models.Comments.create({ comment: xss(req.body.comment), UserId: userId, PostId: req.params.id})
				.then(comment => {
					logger.info(`User ${userId} has commented post ${req.params.id}`)
					res.status(201).json({ message: `Your comment has been sent !`, comment})
				}).catch(err => {
					logger.info(`User ${userId} couldn't comment post ${req.params.id}`);
					res.status(500).json(err)
				    })
		        }
	        }
}

exports.createReport = (req, res, next) => {
	let regex = /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£€%=\^`]/
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth) {
		logger.info(`An unauthenticated user tried to create a comment report`)
		res.status(400).json({message: `You're not authenticated, please log in!`})
	} else {
		if(req.body.report === null){
			res.status(400).json({ message: 'Report is required'})
		} else if (validator.matches(req.body.report, regex)){
			res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
		} else {
			models.ReportComments.create({
				CommentId: req.params.comment_id,
				PostId: req.params.id,
				UserId: userId,
				report: xss(req.body.report),
				status: 'pending'
			})
				.then((report) => {
					logger.info(`User ${userId} has created a comment report about comment ${req.params.comment_id}`)
					res.status(201).json({ message: `Your report has been sent, we'll eventually contact you if we need more information !`, report })
				}).catch((err) => {
					logger.info(`User ${userId} couldn't create a comment report about comment ${req.params.comment_id}`);
					res.status(500).json(err)
				})
		}

	}
}

exports.update = (req, res, next) => {
	let regex = /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£€%=\^`]/
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth)
	if(!headerAuth) {
		logger.info(`an unauthenticated user tried to update a comment`)
		res.status(400).json({message: `You're not authenticated, please log in!`})
	} else {
		if(req.body.comment === null){
			res.status(400).json({ message: 'Comment is required'})
		} else if(validator.matches(req.body.comment, regex)){
			res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
		} else {
			models.Users.findOne({where: {id: userId}})
				.then(user => {
					if(!user){
						res.status(400).json({ message: `We couldn't authenticate user, please log in or sign up !`})
					} else {
						models.Comments.findOne({ where: { id: req.params.comment_id }})
							.then((comment) => {
								if(comment && userId === comment.user_id || user.role.includes('admin')){
									models.Comments.update({ comment: xss(req.body.comment) }, { where: { id: req.params.comment_id }})
										.then(() => {
											logger.info(`User ${userId} has updated comment ${req.params.comment_id}`)
											res.status(200).json({ message: `Your comment has been updated !`})
										})
										.catch((err) => {
											logger.info(`User ${userId} couldn't update comment ${req.params.comment_id}`);
											res.status(500).json(err)
										})
								} else {
									logger.info(`User ${userId} has tried to update comment ${req.params.comment_id}`)
									res.status(403).json({ message: `You're not allowed to update this comment`})
								}
							})
							.catch((err) => {
								logger.info(`Something went wrong when trying to search a comment (function updateComment)`);
								res.status(404).json({ message: `This comment doesn't exist `, err})
							})
					}
				})

		}
	}
}

exports.delete = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth) {
		logger.info(`An unauthenticated user tried to delete a comment`)
		res.status(400).json({message: `You're not authenticated, please log in!`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				models.Comments.findOne({where: {id: req.params.comment_id}})
					.then(comment => {
						if (userId === comment.user_id || role.includes('admin')) {
							models.ReportComments.destroy({where: {comment_id: req.params.comment_id}})
								.then(() => {
									models.Comments.destroy({where: {id: req.params.comment_id}})
										.then(() => {
											logger.info(`User ${userId} has deleted comment ${req.params.comment_id}`)
											res.status(200).json({message: `Comment has been deleted !`})
										})
										.catch(err => {
											logger.info(`User ${userId} couldn't delete comment ${req.params.comment_id}`);
											res.status(500).json(err)
										})
								}).catch(err => {
									logger.info(`User ${userId} couldn't delete a comment report (function delete comment)`);
									res.status(500).json(err)
								})
						} else {
							logger.info(`User ${userId} tried to delete comment ${req.params.comment_id}`)
							res.status(403).json({ message: `You're not allowed to delete this comment`})
						}
					}).catch((err) => {
						logger.info(`Something went wrong when trying to search a comment`);
						res.status(404).json({message: `This comment doesn't exist `, err})
					})
			}).catch(err => {
				logger.info(`Something went wrong when trying to search an user (function delete comment)`);
				res.status(500).json(err)
			})
	}
}

exports.readOne = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth) {
		logger.info(`An unauthenticated user tried to delete a comment`)
		res.status(400).json({message: `You're not authenticated, please log in!`})
	} else {
		models.Comments.findOne({ where: { id: req.params.comment_id }})
			.then(comment => {
				logger.info(`User got comment ${req.params.comment_id}`)
				hateoasComment(req, res, comment, `api/posts/${req.params.id}`)
			}).catch(err => {logger.info(`Something went wrong when trying to search for a comment (function readOne comment)`); res.status(500).json(err)})
	}
}


exports.readAll = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth) {
		logger.info(`An unauthenticated user tried to delete a comment`)
		res.status(400).json({message: `You're not authenticated, please log in!`})
	} else {
		models.Comments.findAll({where: {PostId: req.params.id}, include: [models.Users],
			order: [
				['id', 'ASC']
			]
		})
			.then(comment => {
				let comments = comment
				comments.forEach(comment => {
					comment.User.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${comment.User.url_profile_picture}`
				})
				logger.info(`User got all comments from post ${req.params.id}`)
				hateoasComment(req, res, comments, `api/posts/${req.params.id}`)
			}).catch(err => {logger.info(`Something went wrong when trying to search for all comments from post ${req.params.id}`);res.status(500).json(err)})
	}
}
