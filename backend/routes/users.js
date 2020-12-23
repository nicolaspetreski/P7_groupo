const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer-config')
const userCtrl = require('../controllers/users');
const rateLimit = require('express-rate-limit')

router.post('/signup', rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 3,
	message:"Too many accounts created from this IP, please try again after an hour"
}), multer, userCtrl.signup);

router.post('/login', rateLimit({
	windowMs: 60000,
	max: 3
}), userCtrl.login);

router.get('/:id', userCtrl.readOne);
router.put('/:id', multer, userCtrl.update);
router.delete('/:id', multer, userCtrl.delete);
router.put('/:id/update_privilege', userCtrl.updatePrivilege);
router.get('/', userCtrl.readAll)


module.exports = router;