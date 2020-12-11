const models = require('../models'); //Importation du modele Post
const bodyParser = require('body-parser'); //importation de body-parser pour extraire des objets JSOn

//                        REQUETES
//Get all posts
exports.getAllPost = (req, res, next) => {
  models.Post.findAll({
    order: [['createdAt', 'DESC']]
  }).then(posts => res.status(200).json(posts))
    .catch(error => res.status(400).json({ error }));
}

//Creation post
exports.addPost = (req, res, next) => {

  //Parametres
  const id_users = req.body.id_users
  const title = req.body.title;
  const content = req.body.content;
  const userId = req.body.userId;


  //Verification des parametres
  if (title == null || content == null) {
    return res.status(400).json({ 'error': 'missing parameters' })
  }

  //Creation d'un post
  const newPost = models.Post.create({
    id_users: id_users,
    title: title,
    content: content,
    UserId: userId
  })
    .then(function (newPost) {
      return res.status(201).json({
        'postId': newPost.id
      })
    })
    .catch(function (err) {
      return res.status(500).json({ 'error': 'cannot add post' })
    })
};

//Supprimer post
exports.deletePost = (req, res, next) => {
  let id = req.body.id
  console.log(req.body)
  models.Post.destroy({ where: { id: id } })
    .then(() => res.status(200).json({ message: 'Post deleted !' }))
    .catch(error => res.status(500).json({ error }));
} 
