// projectSchema.js
const Joi = require('joi');

exports.projectCreateSchema = Joi.object({
    project_name: Joi.string().required(),
    project_requirements: Joi.string().required(),
    project_startDate: Joi.date().iso().required(),
    project_endDate: Joi.date().iso().allow(null),
    project_status: Joi.string().valid('Pending', 'Ongoing', 'Completed').required(),
    assign_with_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});
