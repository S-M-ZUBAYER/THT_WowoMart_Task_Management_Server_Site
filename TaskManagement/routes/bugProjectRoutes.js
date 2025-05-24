const express = require('express');
const router = express.Router();
const controller = require('../controller/bugProjectController');

router.post('/taskManagement/api/projectBug/create', controller.create);
router.get('/taskManagement/api/projectBug/projectName/getAll', controller.getAll);
router.get('/taskManagement/api/projectBug/with-bugs/getAll', controller.getAllWithBugs);
router.put('/taskManagement/api/projectBug/:id', controller.updateProjectName);
router.post('/taskManagement/api/projectBug/deleteProjectNameWithAllBug', controller.deleteProjectAndBugs);

module.exports = router;
