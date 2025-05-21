const { createDiscussionSchema } = require('../schemas/discussionSchema');
const DiscussionModel = require('../model/discussionModel');
const { updateDiscussionSchema } = require('../schemas/discussionSchema');

// exports.createDiscussion = async (req, res) => {
//     try {
//         const { error, value } = createDiscussionSchema.validate(req.body);
//         if (error) {
//             return res.status(400).json({ status: 400, message: error.details[0].message, result: null });
//         }

//         const discussion_with_ids = value.discussion_with_ids.join(',');
//         const data = { ...value, discussion_with_ids };
//         const result = await DiscussionModel.createDiscussion(data);

//         res.status(201).json({ status: 201, message: 'Discussion created successfully', result: { insertId: result.insertId } });
//     } catch (err) {
//         console.error('Error creating discussion:', err);
//         res.status(500).json({ status: 500, message: 'Internal server error', result: null });
//     }
// };


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
