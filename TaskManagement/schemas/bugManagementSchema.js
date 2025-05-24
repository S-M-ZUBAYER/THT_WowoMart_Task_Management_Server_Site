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
    assignWith: Joi.array().items(Joi.number()).messages({
        'any.required': 'AssignWith is required',
        'array.base': 'AssignWith must be an array of user IDs'
    }),

    priority: Joi.string().valid('High', 'Medium', 'Low').required(),
    status: Joi.string().valid('Pending', 'In Progress', 'Solved').required(),
    createdEmail: Joi.string().email().required(),
    bugProjectId: Joi.number().required().messages({
        'any.required': 'bugProjectId is required',
        'number.base': 'bugProjectId must be a number'
    })

});

exports.updateBugSchema = this.createBugSchema.keys({
    attachmentFile: Joi.string().optional()
});
