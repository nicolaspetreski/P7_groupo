const multer = require('multer');

const MIME_TYPES = {
	'image/jpg': 'jpg',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/gif': 'gif'
};

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'images');
	},
	filename: (req, file, callback) => {
		const random = (Math.floor(Math.random()*Math.pow(10, 10))).toString();
		const extension = MIME_TYPES[file.mimetype];
		if(extension !== undefined){
			callback(null, random + '.' + extension);
		}
	}
});

module.exports = multer({storage: storage}).single('image');