const express = require('express');
const {register, login, getMe} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register',register);
router.post('/login',login);
router.get('/me',protect,getMe);
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({success: true, msg: 'Logged out successfully'});
});

module.exports = router;