const { createDiscussionSchema } = require('../schemas/discussionSchema');
const DiscussionModel = require('../model/discussionModel');
const { updateDiscussionSchema } = require('../schemas/discussionSchema');
const attachmentModel = require('../model/attachmentModel');


exports.createDiscussion = async (req, res) => {
    // ✅ Parse discussion_with_ids if it’s a string
    if (typeof req.body.discussion_with_ids === 'string') {
        try {
            req.body.discussion_with_ids = JSON.parse(req.body.discussion_with_ids);
        } catch (parseError) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid discussion_with_ids format. Must be a JSON array.',
                result: null
            });
        }
    }

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

        // ✅ Parse JSON string if necessary
        if (typeof req.body.discussion_with_ids === 'string') {
            try {
                req.body.discussion_with_ids = JSON.parse(req.body.discussion_with_ids);
            } catch (parseError) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid discussion_with_ids format. Must be a JSON array.',
                    result: null
                });
            }
        }

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

exports.getDiscussionsById = async (req, res) => {
    try {
        const { id } = req.params;
        const discussion = await DiscussionModel.getDiscussionsById(id);

        if (!discussion) {
            return res.status(404).json({
                status: 404,
                message: 'Discussion not found',
                result: null
            });
        }

        const attachments = await DiscussionModel.getAttachmentsByDiscussionId(id);
        const discussionWithAttachments = { ...discussion, attachments };

        res.status(200).json({
            status: 200,
            message: 'Discussion fetched successfully',
            result: discussionWithAttachments
        });

    } catch (err) {
        console.error('Error fetching discussion:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};

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

exports.deleteByDiscussionId = async (req, res) => {
    try {
        const { discussion_id } = req.body;
        await attachmentModel.deleteDiscussionIdAttachment(discussion_id);
        await DiscussionModel.deleteDiscussionById(discussion_id);
        res.status(200).json({ status: 200, message: 'Discussion deleted successfully' });
    } catch (err) {
        console.error('Error deleting discussion by ID:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.deleteDiscussionByIdForTaskIdController = async (req, res) => {
    const { discussion_id } = req.body;

    if (!discussion_id || typeof discussion_id !== 'number') {
        return res.status(400).json({ status: 400, message: 'discussion_id must be a number' });
    }

    try {
        await DiscussionModel.deleteByDiscussionIdForTaskId(discussion_id);
        res.status(200).json({ status: 200, message: 'Discussion deleted successfully' });
    } catch (err) {
        console.error('Controller error while deleting discussion:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};