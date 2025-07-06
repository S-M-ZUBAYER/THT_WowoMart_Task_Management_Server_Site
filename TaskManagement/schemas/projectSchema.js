// projectSchema.js
const Joi = require('joi');

exports.projectCreateSchema = Joi.object({
    project_name: Joi.string().required(),
    project_requirements: Joi.string().required(),
    project_startDate: Joi.date().iso().required(),
    project_endDate: Joi.date().iso().allow(null).optional(),
    project_status: Joi.string().valid('To Do', 'In Progress', 'Completed').required(),
    assign_with_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    resource_files: Joi.any(),
});
