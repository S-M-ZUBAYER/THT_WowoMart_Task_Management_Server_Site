const Joi = require('joi');

exports.createReportSchema = Joi.object({
    employeeName: Joi.string().required(),
    employeeEmail: Joi.string().email().required(),
    employeeId: Joi.string().required(),
    reportDetails: Joi.string().required(),
    reportDate: Joi.date().required(),
});

exports.updateReportSchema = Joi.object({
    id: Joi.number().required(),
    employeeName: Joi.string(),
    employeeEmail: Joi.string().email(),
    employeeId: Joi.string(),
    reportDetails: Joi.string(),
    reportDate: Joi.date(),
});
