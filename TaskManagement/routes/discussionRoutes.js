const express = require('express');
const router = express.Router();
const discussionController = require('../controller/discussionController');

router.post('/taskManagement/api/taskDiscussion/create', discussionController.createDiscussion);
router.post('/taskManagement/api/taskDiscussion/update/:id', discussionController.updateDiscussion);
router.get('/taskManagement/api/taskDiscussion/by-task/:taskId', discussionController.getDiscussionsByTaskId)
router.post('/taskManagement/api/taskDiscussion/delete-by-task-id', discussionController.deleteByTaskId);
router.post('/taskManagement/api/taskDiscussion/delete-by-id', discussionController.deleteByDiscussionId);

module.exports = router;
