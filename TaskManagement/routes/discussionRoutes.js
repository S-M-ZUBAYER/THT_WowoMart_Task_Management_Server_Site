const express = require('express');
const router = express.Router();
const discussionController = require('../controller/discussionController');

router.post('/taskManagement/api/taskDiscussion/create', discussionController.createDiscussion);
router.put('/taskManagement/api/taskDiscussion/update/:id', discussionController.updateDiscussion);

// Get discussions by task ID
router.get('/taskManagement/api/taskDiscussion/by-task/:taskId', discussionController.getDiscussionsByTaskId)

// Delete all discussions and attachments by task ID
router.post('/taskManagement/api/taskDiscussion/delete-by-task-id', discussionController.deleteByTaskId);

// Delete a specific discussion by ID
router.post('/taskManagement/api/taskDiscussion/delete-by-id', discussionController.deleteByDiscussionId);

module.exports = router;
