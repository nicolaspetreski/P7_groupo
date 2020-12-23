const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comments')

router.post('/:id/comments', commentCtrl.create)
router.post('/:id/:comment_id/report', commentCtrl.createReport)
router.put('/:id/:comment_id', commentCtrl.update)
router.delete('/:id/:comment_id', commentCtrl.delete)
router.get('/:id/:comment_id', commentCtrl.readOne)
router.get('/:id/all/comments', commentCtrl.readAll)

module.exports = router;

