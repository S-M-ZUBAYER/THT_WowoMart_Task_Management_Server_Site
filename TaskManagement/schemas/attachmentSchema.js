const Joi = require('joi');

exports.createAttachmentSchema = Joi.object({
    discussion_id: Joi.number().integer().positive().required()
});
