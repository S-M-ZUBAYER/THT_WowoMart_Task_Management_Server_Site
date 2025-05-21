const Joi = require('joi');

exports.registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    designation: Joi.string().required(),
    phone: Joi.string().required(),
    joiningDate: Joi.date().required(),
    image: Joi.string().base64().required()
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

exports.updateUserSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    role: Joi.string().required(),
    designation: Joi.string().required(),
    phone: Joi.string().required(),
    joiningDate: Joi.date().required(),
    image: Joi.string().base64().required()
});

// exports.deleteUserSchema = Joi.object({
//     id: Joi.number().required()
// });

exports.deleteUserSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': '"id" must be a number',
        'number.integer': '"id" must be an integer',
        'number.positive': '"id" must be a positive number',
        'any.required': '"id" is a required field'
    })
});



exports.findUsersByIdsSchema = Joi.object({
    ids: Joi.array()
        .items(Joi.number().integer().positive().required())
        .min(1)
        .required()
        .messages({
            'array.base': '"ids" must be an array',
            'array.min': 'At least one ID is required',
            'any.required': '"ids" is a required field',
            'number.base': 'Each ID must be a number',
            'number.integer': 'Each ID must be an integer',
            'number.positive': 'Each ID must be a positive number'
        })
});
