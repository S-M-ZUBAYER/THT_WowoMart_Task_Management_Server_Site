const Joi = require('joi');

exports.createDiscussionSchema = Joi.object({
    task_id: Joi.number().integer().positive().required(),
    title: Joi.string().required(),
    discussion_date: Joi.date().required(),
    details: Joi.string().required(),
    discussion_with_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});

exports.updateDiscussionSchema = Joi.object({
    title: Joi.string().required(),
    discussion_date: Joi.date().required(),
    details: Joi.string().required(),
    discussion_with_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});
