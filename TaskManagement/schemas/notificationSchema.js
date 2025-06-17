const Joi = require('joi');

const notificationSchema = Joi.object({
    userId: Joi.string().required(),
    from: Joi.string().required(),
    name: Joi.string().allow(''),
    message: Joi.string().required(),
    date: Joi.string().required(),
    type: Joi.string().valid(
        'admin_notification',
        'user_notification',
        'user_all_notification',
        'direct_notification'
    ).required(),
    path: Joi.string().required(),
});

module.exports = {
    validateNotification: (data) => notificationSchema.validate(data)
};
