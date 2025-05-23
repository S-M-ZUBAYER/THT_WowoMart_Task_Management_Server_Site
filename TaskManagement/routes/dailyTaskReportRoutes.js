const express = require('express');
const router = express.Router();
const controller = require('../controller/dailyTaskReportController');

router.post('/taskManagement/api/dailyTaskReport/create', controller.create);
router.put('/taskManagement/api/dailyTaskReport/update', controller.updateById);
router.get('/taskManagement/api/dailyTaskReport/:id', controller.getById);
router.get('/taskManagement/api/dailyTaskReport/email/:email', controller.getByEmail);
router.get('/taskManagement/api/dailyTaskReport/get/all', controller.getAll);
router.get('/taskManagement/api/dailyTaskReport/byDate/:date', controller.getByDate);
router.post('/taskManagement/api/dailyTaskReport/deleteById', controller.deleteById);
router.post('/taskManagement/api/dailyTaskReport/delete/multiple', controller.deleteByMultipleId);
router.post('/taskManagement/api/dailyTaskReport/deleteByEmail', controller.deleteByEmail);

module.exports = router;
