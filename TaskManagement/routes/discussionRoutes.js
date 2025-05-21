const express = require('express');
const router = express.Router();
const discussionController = require('../controller/discussionController');

router.post('/taskManagement/api/taskDiscussion/create', discussionController.createDiscussion);
router.put('/taskManagement/api/taskDiscussion/update/:id', discussionController.updateDiscussion);

module.exports = router;
