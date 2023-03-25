const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');


router.get('/getAll', UserController.show);

router.put('/edit', UserController.update);


module.exports = router;