const Joi = require('joi');

exports.createBugSchema = Joi.object({
    projectName: Joi.string().max(255).required().messages({
        'any.required': 'Project name is required',
        'string.max': 'Project name must be under 255 characters'
    }),
    BugDetails: Joi.string().required().messages({
        'any.required': 'Bug details are required'
    }),
    findDate: Joi.date().iso().required().messages({
        'any.required': 'Find date is required',
        'date.base': 'Invalid date format'
    }),
    solveDate: Joi.string().optional().allow('', null),// ✅ Optional,
    asignWith: Joi.string().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').required(),
    status: Joi.string().valid('Pending', 'In Progress', 'Resolved').required(),
    createdEmail: Joi.string().email().required(),
});

exports.updateBugSchema = this.createBugSchema.keys({
    attachmentFile: Joi.string().optional()
});
