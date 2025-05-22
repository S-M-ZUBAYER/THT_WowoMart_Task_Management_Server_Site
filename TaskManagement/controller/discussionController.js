const { createDiscussionSchema } = require('../schemas/discussionSchema');
const DiscussionModel = require('../model/discussionModel');
const { updateDiscussionSchema } = require('../schemas/discussionSchema');



exports.createDiscussion = async (req, res) => {
    console.log('Incoming body:', req.body);

    try {
        const { error, value } = createDiscussionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
                result: null
            });
        }

        // ✅ Ensure discussion_with_ids exists and is an array
        const discussion_with_ids = Array.isArray(value.discussion_with_ids)
            ? value.discussion_with_ids.join(',')
            : '';

        const data = { ...value, discussion_with_ids };
        const result = await DiscussionModel.createDiscussion(data);

        res.status(201).json({
            status: 201,
            message: 'Discussion created successfully',
            result: { insertId: result.insertId }
        });

    } catch (err) {
        console.error('Error creating discussion:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};


exports.updateDiscussion = async (req, res) => {
    try {
        const discussionId = req.params.id;
        const { error, value } = updateDiscussionSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message, result: null });
        }

        const discussion_with_ids = value.discussion_with_ids.join(',');
        const updatedData = { ...value, discussion_with_ids };

        const result = await DiscussionModel.updateDiscussion(discussionId, updatedData);

        res.status(200).json({ status: 200, message: 'Discussion updated successfully', result });
    } catch (err) {
        console.error('Error updating discussion:', err);
        res.status(500).json({ status: 500, message: 'Internal server error', result: null });
    }
};


// Get discussions by task ID with attachments
exports.getDiscussionsByTaskId = async (req, res) => {
    try {
        const { taskId } = req.params;
        const discussions = await DiscussionModel.getDiscussionsByTask(taskId);

        // Fetch attachments for each discussion
        const discussionsWithAttachments = await Promise.all(
            discussions.map(async (discussion) => {
                const attachments = await DiscussionModel.getAttachmentsByDiscussionId(discussion.id);
                return { ...discussion, attachments };
            })
        );

        res.status(200).json({
            status: 200,
            message: 'Discussions fetched successfully',
            result: discussionsWithAttachments
        });

    } catch (err) {
        console.error('Error fetching discussions:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};


// Get attachments by discussion ID
exports.getAttachmentsByDiscussionId = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const result = await DiscussionModel.getAttachmentsByDiscussionId(discussionId);
        res.status(200).json({ status: 200, result });
    } catch (err) {
        console.error('Error fetching attachments:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

// Delete all discussions and attachments by task ID
exports.deleteByTaskId = async (req, res) => {
    try {
        const { task_id } = req.body;
        await DiscussionModel.deleteAttachmentsByTaskId(task_id);
        await DiscussionModel.deleteDiscussionsByTaskId(task_id);
        res.status(200).json({ status: 200, message: 'Deleted discussions and attachments for the task' });
    } catch (err) {
        console.error('Error deleting discussions by task ID:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

// Delete discussion by ID
exports.deleteByDiscussionId = async (req, res) => {
    try {
        const { discussion_id } = req.body;
        await DiscussionModel.deleteAttachmentsByDiscussionId(discussion_id);
        await DiscussionModel.deleteDiscussionById(discussion_id);
        res.status(200).json({ status: 200, message: 'Discussion deleted successfully' });
    } catch (err) {
        console.error('Error deleting discussion by ID:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};