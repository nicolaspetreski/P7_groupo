require('dotenv').config();
//const hateoas = require('../HATEOAS/hateoasPosts')
const models = require('../models');
const validator = require('validator');
const jwtUtils = require('../middlewares/auth');
const fs = require('fs');
const logger = require('../middlewares/winston');
const xss = require('xss');


exports.create = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let regex = /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£€%=\^`]/
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function create(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		if(!req.file){
			res.status(400).json({message: `File is required`})
		} else if (validator.matches(req.body.title, regex) || validator.matches(req.body.content, regex)) {
			res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
		} else {
			let userId = jwtUtils.getUserId(headerAuth);
			let urlGif, altGif;
			urlGif = req.file.filename
			altGif = "GIF partagé par l'utilisateur"
			models.Posts.create({ title: xss(req.body.title), UserId: userId, content: xss(req.body.content), url_gif: urlGif, alt_gif: altGif })
				.then((post) => {
					logger.info(`User ${userId} has published a post`)
					res.status(201).json({message: `You're post has been created !`, post})
				})
				.catch((err) => {
					logger.info(`Something went wrong when trying to create a post`)
					res.status(500).json(err)
				})
		}
	}
}

exports.createLike = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function createLike(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		let userId = jwtUtils.getUserId(headerAuth);
		models.Likes.findOne({ where: { user_id: userId, post_id: req.params.id }})
			.then(likes => {
				if(likes){
					models.Likes.destroy({ where: { user_id: userId, post_id: req.params.id}})
						.then(() => {
							logger.info(`User ${userId} has disliked post ${req.params.id}`)
							res.status(200).json({message: `Your like has been removed from that post !`})
						})
						.catch(error => {
							logger.info(`Something went wrong when trying to dislike post ${req.params.id}`)
							res.status(400).json({error})
						})
				} else {
					models.Likes.create({
						post_id: req.params.id,
						user_id: userId
					})
						.then((like) => {
							logger.info(`User ${userId} has liked post ${req.params.id}`)
							res.status(201).json(like)
						})
						.catch(error => {
							logger.info(`Something went wrong when trying to like post ${req.params.id}`)
							res.status(400).json({error})
						})
				}
			}).catch(err => {
			logger.info(`Somethig went wrong when trying to find likes in function createLike(post)`)
			res.status(500).json(err)
		})
	}

}

exports.readLike = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userLiked = []
	let userInfo = []
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function readLike(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		models.Likes.findAll({ where: { post_id: req.params.id },
			order: [
				[ 'created_at', 'ASC']
			]})
			.then((likes) => {
				if(likes.length > 0){
					for(let i in likes){
						userLiked.push(likes[i].user_id)
					}
					for(let k = 0; k < userLiked.length; k++){
						models.Users.findOne({ where: { id: userLiked[k] } })
							.then((user => {
								userInfo.push({id:user.id, username: user.username, url_profile_picture: `${req.protocol}://${req.get('host')}/images/${user.url_profile_picture}`, alt_profile_picture: user.alt_profile_picture})
								if(k === userLiked.length -1){
									logger.info(`An user got likes for post ${req.params.id}`)
									res.status(200).json(userInfo)
								}
							})).catch(err => {
							logger.info(`Something went wrong when trying to find users in function readLike(post)`)
							res.status(500).json(err)
						})
					}
				} else {
					logger.info(`an user got likes for post ${req.params.id} - here zero`)
					res.status(200).json(likes)
				}

			}).catch(err => {
			logger.info(`Something went wrong when trying to find all likes in function readLike(post)`)
			res.status(500).json(err)
		})
	}

}

exports.update = (req, res, next) => {
	let regex = /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£%=\^`]/
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function update(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		if (req.body.title && validator.matches(req.body.title, regex) || req.body.content && validator.matches(req.body.content, regex)) {
			res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
		} else {
			let userId = jwtUtils.getUserId(headerAuth);
			models.Users.findOne({where: {id: userId}})
				.then((user) => {
					models.Posts.findOne({where: {id: req.params.id}})
						.then((post) => {
							if (post && userId === post.user_id || JSON.parse(user.role).includes('admin')) {
								let urlGif, altGif;
								if (req.file) {
									if (post.url_gif !== null) {
										const filename = post.url_gif;
										fs.unlink(`images/${filename}`, () => {
											//
										})
									}
									urlGif = req.file.filename
									altGif = "GIF partagé par l'utilisateur"
								} else {
									urlGif = post.url_gif;
									altGif = "GIF partagé par l'utilisateur"
								}
								models.Posts.update({
									...req.body,
									url_gif: urlGif,
									alt_gif: altGif
								}, {where: {id: req.params.id}})
									.then(() => {
										logger.info(`User ${userId} has updated post ${req.params.id}`)
										res.status(200).json({message: `Your post has been updated !`})
									})
									.catch((err) => {
										logger.info(`Something went wrong when trying to update post ${req.params.id}`)
										res.status(500).json(err)
									})
							} else {
								logger.info(`User ${userId} tried to update post ${req.params.id}`)
								res.status(403).json({message: `You're not allowed to update this post ! `})
							}
						})
						.catch((err) => {
							logger.info(`Something went wrong when trying to find post ${req.params.id}`)
							res.status(404).json({message: `This post doesn't exist `, err})
						})
				}).catch(err => {
				logger.info(`Something went wrong when trying to find user in function update(post)`)
				res.status(500).json(err)
			})
		}

	}

}

exports.delete = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function delete(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		let userId = jwtUtils.getUserId(headerAuth);
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				models.Posts.findOne({where: {id: req.params.id}})
					.then(post => {
						if (post && userId === post.user_id || role.includes('admin')) {
							const filename = post.url_gif;
							fs.unlink(`images/${filename}`, () => {
								models.ReportComments.destroy({where: {post_id: post.id}})
									.then(() => {
										models.Comments.destroy({where: {post_id: post.id}})
											.then(() => {
												models.Likes.destroy({where: {post_id: post.id}})
													.then(() => {
														models.ReportPosts.destroy({
															where: {PostId: post.id},
															include: [models.Likes]
														})
															.then(() => {
																models.Posts.destroy({where: {id: post.id}})
																	.then(() => {
																		logger.info(`User ${userId} has deleted post ${req.params.id}`)
																		res.status(200).json({message: 'Post deleted'})
																	}).catch(err => {
																	logger.info(`Something went wrong when trying to delete post ${req.params.id}`)
																	res.status(500).json({err})
																})
															}).catch(err => {
															logger.info(`Something went wrong when trying to delete postReports corresponding with post ${req.params.id}`)
															res.status(500).json(err)
														})
													}).catch(err => {
													logger.info(`Something went wrong when trying to delete likes corresponding with post ${req.params.id}`)
													res.status(500).json(err)
												})
											}).catch(err => {
											logger.info(`Something went wrong when trying to delete comments corresponding to post ${req.params.id}`)
											res.status(500).json(err)
										})
									}).catch(err => {
									logger.info(`something went wrong when trying to delete commentsReports corresponding to post ${req.params.id}`)
									res.status(500).json(err)
								})
							})
						} else {
							logger.info(`User ${userId} tried to delete post ${req.params.id}`)
							res.status(401).json({message: `You're not allowed to delete this post !`})
						}
					}).catch(err => {
					logger.info(`something went wrong when trying to find post ${req.params.id}`)
					res.status(404).json(err)
				})
			}).catch(err => {
			logger.info(`something went wrong when trying to find user in function delete(post)`)
			res.status(500).json(err)
		})
	}

}

exports.readOne = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function readOne(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		let userId = jwtUtils.getUserId(headerAuth);
		models.Posts.findOne({ where: { id: req.params.id }})
			.then((posts) => {
				let post = posts
				post.url_gif = `${req.protocol}://${req.get('host')}/images/${posts.url_gif}`
				if(post.User){
					post.User.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${post.User.url_profile_picture}`
				}
				logger.info(`User ${userId} got post ${req.params.id} info`)
				hateoas(req, res, post, 'api/posts')
			})
			.catch((err) => {
				logger.info(`something went wrong when trying to find post ${req.params.id}`)
				res.status(404).json(err)
			})
	}


}


exports.readAll = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function readAll(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		models.Posts.findAll({ include: [models.Users, models.Comments, models.Likes],
			order: [
				['id', 'DESC']
			]
		})
			.then(post => {
				let posts = post
				posts.forEach(post => {
					post.url_gif = `${req.protocol}://${req.get('host')}/images/${post.url_gif}`
					post.User.url_profile_picture = `${req.protocol}://${req.get('host')}/images/${post.User.url_profile_picture}`
				})
				logger.info(`user got all posts infos`)
				hateoas(req, res, posts, 'api/posts')
			})
			.catch(err => {
				logger.info(`something went wrong when trying to find all posts`)
				res.status(500).json(err)
			})
	}

}

exports.readAllFromUserId = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function ReadAllFromUserId`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		models.Posts.findAll({ where: { user_id: req.params.user_id }, include: [models.Likes, models.Comments]}, {
			order: [
				['created_at', 'DESC']
			]
		})
			.then(post => {
				let posts = post
					posts.forEach(post => {
						post.url_gif = `${req.protocol}://${req.get('host')}/images/${post.url_gif}`
					})
				logger.info(`User got all posts from user ${req.params.user_id}`)
				res.status(200).json(posts)
			})
			.catch(err => {
				logger.info(`something went wrong when trying to find all posts from user ${req.params.user_id}`)
				res.status(500).json(err)
			})
	}

}

exports.createReport = (req, res, next) => {
	let regex = /[\|\/\\\*\+&#\{\(\[\]\}\)<>$£%=\^`]/
	const headerAuth = req.headers['authorization'];
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function createReport(post)`)
		res.status(400).json({ message: `You're not authenticated, please log in ! `})
	} else {
		if (req.body.report === null) {
			res.status(400).json({ message: `Report is required`})
		} else if (validator.matches(req.body.report, regex)) {
			res.status(422).json({message: `Wrong format - Please don't use : |/*+&#{([]})<>$£€%=^`})
		} else {
			let userId = jwtUtils.getUserId(headerAuth);
			models.ReportPosts.create({
				PostId: req.params.id,
				UserId: userId,
				report: xss(req.body.report),
				status: 'pending'
			})
				.then((report) => {
					logger.info(`User ${userId} has created a post report for post ${req.params.id}`)
					res.status(201).json({
						message: `Your report has been sent, we'll eventually contact you if we need more information !`,
						report
					})
				}).catch((err) => {
				logger.info(`something went wrong when trying to create report for post ${req.params.id}`)
				res.status(500).json(err)
			})
		}
	}

}

