const Joi = require('joi');

exports.createTaskSchema = Joi.object({
    task_title: Joi.string().max(255).required().messages({
        'any.required': 'Task title is required',
        'string.max': 'Task title must be under 255 characters'
    }),
    task_details: Joi.string().required().messages({
        'any.required': 'Task details are required'
    }),
    task_starting_time: Joi.date().iso().required().messages({
        'any.required': 'Task starting time is required',
        'date.base': 'Invalid date format for task starting time'
    }),
    task_deadline: Joi.date().iso().required().messages({
        'any.required': 'Task deadline is required',
        'date.base': 'Invalid date format for task deadline'
    }),
    task_completing_date: Joi.date().iso().allow(null).messages({
        'date.base': 'Invalid date format for task completing date'
    }),
    assigned_employee_ids: Joi.array().items(
        Joi.number().integer().positive()
    ).min(1).required().messages({
        'array.base': 'Assigned employees must be an array of IDs',
        'array.min': 'At least one employee must be assigned'
    }),
    status: Joi.string().valid('To Do', 'In Progress', 'Completed').required().messages({
        'any.only': 'Status must be one of: To Do, In Progress, Completed',
        'any.required': 'Status is required'
    })
});

exports.updateTaskSchema = Joi.object({
    task_title: Joi.string().required(),
    task_details: Joi.string().required(),
    task_starting_time: Joi.date().required(),
    task_deadline: Joi.date().required(),
    task_completing_date: Joi.date().allow(null),
    assigned_employee_ids: Joi.array().items(Joi.number().integer()).required(),
    status: Joi.string().valid('To Do', 'In Progress', 'Completed').required()
});

