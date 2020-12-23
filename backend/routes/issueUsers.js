const express = require('express');
const router = express.Router();
const issueCtrl = require('../controllers/issueUsers');

router.post('/', issueCtrl.create)
router.put('/:id', issueCtrl.update)
router.get('/all/pending', issueCtrl.readAllPending)
router.get('/all/messageWaiting', issueCtrl.readMessageWaiting)
router.get('/', issueCtrl.readAll)
router.delete('/:id', issueCtrl.delete)

module.exports = router;
