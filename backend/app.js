const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { expressShield } = require('node-shield');
const helmet = require('helmet');
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const reportPostsRoutes = require('./routes/reportPosts');
const reportCommentsRoutes = require('./routes/reportComments');
const commentsRoutes = require('./routes/comments');
const researchRoutes = require('./routes/research');
const issueRoutes = require('./routes/issueUsers');
const path = require('path');

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use(expressShield({
	errorHandler: (shieldError, req, res, next) => {
		console.error(shieldError);
		res.sendStatus(400);
	}
}));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/files', express.static(path.join(__dirname, 'files')));

app.use('/api/posts', postsRoutes);
app.use('/api/auth', usersRoutes);
app.use('/api/report', reportPostsRoutes);
app.use('/api/report/comment', reportCommentsRoutes);
app.use('/api/posts', commentsRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/issue', issueRoutes);

module.exports = app;