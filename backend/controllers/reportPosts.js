require('dotenv').config();
const models = require('../models');
const jwtUtils = require('../middlewares/auth');
const logger = require('../middlewares/winston');


exports.readAll = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function readAll (postReports)`)
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				if (!role.includes('admin')) {
					logger.info(`User ${userId} tried to access to function readAll(postReports)`)
					res.status(403).json({message: `You're not allowed for this route !`})
				} else {
					models.ReportPosts.findAll({
						order: [
							['id', 'DESC']
						]
					})
						.then(postReport => {
							models.ReportComments.findAll({
								order: [
									['id', 'DESC']
								]
							}).then(commentReport => {
								logger.info(`User ${userId} got all reports`)
								let postReports = hateoasReport(req, postReport, 'api/report')
								let commentReports = hateoasReport(req, commentReport, 'api/report/comment')
								res.status(200).json({postReports, commentReports})
							}).catch(err => {
								logger.info(`Something went wrong when trying to find all commentsReports in function readAll`)
								res.status(404).json({message: `No reports found`, err})
							})
						}).catch(err => {
						logger.info(`Something went wrong when trying to find all postsReports in function ReadAll`)
						res.status(404).json({message: `No reports found`, err})
					})
				}
			}).catch(err => {
			logger.info(`Something went wrong when trying to find user in function readAll (postReport)`)
			res.status(500).json(err)
		})
	}
}

exports.update = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function update(postReport)`)
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				if (!role.includes('admin')) {
					logger.info(`User ${userId} tried to access to function update (postReport)`)
					res.status(400).json({message: `You're not allowed for this route !`})
				} else {
					models.ReportPosts.update({status: 'treated'}, {where: {id: req.params.id}})
						.then(() => {
							logger.info(`User ${userId} has updated postReport ${req.params.id}`)
							res.status(200).json({message: `Report ${req.params.id} has been updated !`})
						}).catch((err) => {
						logger.info(`Something went wrong when trying to update postReport ${req.params.id}`)
						res.status(500).json(err)
					})
				}
			}).catch(err => {
			logger.info(`Something went wrong when trying to find user in function readAll(postReports)`)
			res.status(500).json(err)
		})
	}
}

exports.delete = (req, res, next) => {
	const headerAuth = req.headers['authorization'];
	let userId = jwtUtils.getUserId(headerAuth);
	if(!headerAuth){
		logger.info(`An unauthenticated user tried to access to function delete(postReports)`)
		res.status(400).json({message: `You're not authenticated, please log in !`})
	} else {
		models.Users.findOne({where: {id: userId}})
			.then(admin => {
				let role = JSON.parse(admin.role);
				if (!role.includes('admin')) {
					logger.info(`User ${userId} tried to access to function delete(postReports)`)
					res.status(400).json({message: `You're not allowed for this route !`})
				} else {
					models.ReportPosts.destroy({where: {id: req.params.id}})
						.then(() => {
							logger.info(`User ${userId} has deleted postReport ${req.params.id}`)
							res.status(200).json({message: `This report has been deleted !`})
						})
						.catch((err) => {
							logger.info(`Something went wrong when trying to delete postReport ${req.params.id}`)
							res.status(404).json({message: `No report found with ID ${req.params.id}`, err})
						})
				}
			}).catch(err => {
			logger.info(`Something went wrong when trying to find user in function delete(postReport)`)
			res.status(500).json(err)
		})
	}
}