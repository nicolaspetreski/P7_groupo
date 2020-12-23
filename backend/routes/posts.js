const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/posts');
const multer = require('../middlewares/multer-config');

router.post('/', multer, postCtrl.create)
router.post('/:id/like', postCtrl.createLike)
router.get('/:id/like', postCtrl.readLike)
router.put('/:id', multer, postCtrl.update)
router.delete('/:id', multer, postCtrl.delete)
router.get('/:id', postCtrl.readOne)
router.post('/:id/report', postCtrl.createReport)
router.get('/from/:user_id', postCtrl.readAllFromUserId)
router.get('/', postCtrl.readAll)


module.exports = router;

