const Joi = require('joi');

exports.createBugProjectSchema = Joi.object({
    bugProjectName: Joi.string().required()
});

exports.updateBugProjectSchema = Joi.object({
    bugProjectName: Joi.string().required()
});
