const express = require('express');
const request = require('request');
const {
	check,
	validationResult
} = require('express-validator/check');
const {
	matchedData,
	sanitize
} = require('express-validator/filter');
const md5 = require('md5');
const router = express.Router();

router.post('/', [
	check('firstName').exists(),
	check('lastName').exists(),
	check('username').exists(),
	check('email')
	.exists()
	.isEmail().withMessage('must be an email')
	.trim()
	.normalizeEmail(),
   check("password", "invalid password")
   .exists()
   .isLength({ min: 5 })
   .custom((value,{req, loc, path}) => {
        if (value !== req.body.password_confirmation) {
           throw new Error("Passwords don't match");
        } else {
           return value;
        }
   })
	.matches(/\d/)
], (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
      console.log(errors.mapped());
      return res.render('index', {errors: errors.mapped()});
	}
	const user = matchedData(req);
   user.password = md5(user.password);

		request.post({
			url: 'https://damp-shelf-73704.herokuapp.com/api/user/create',
	      json: true,
			formData: user
	   }, function(error, response, body){
			if (body.error) {
				console.error('upload failed:', body.error);
	         return res.render('error', {message: body.error});
			}
			console.log('Upload successful!  Server responded with:', body);
	      res.render('success', {
	         name: req.body.firstName + " " + req.body.lastName
	      });
		});
});

module.exports = router;