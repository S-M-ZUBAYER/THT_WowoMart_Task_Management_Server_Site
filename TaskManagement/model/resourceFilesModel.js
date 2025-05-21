const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.createResourceFile = async (taskId, resourceFile, path) => {
    const [result] = await TaskManagementPool.execute(
        'INSERT INTO ResourceFiles (task_id, resource_file, path) VALUES (?, ?, ?)',
        [taskId, resourceFile, path]
    );
    return result;
};

exports.getResourceFilesByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.execute(
        'SELECT * FROM ResourceFiles WHERE task_id = ?',
        [taskId]
    );
    return rows;
};

exports.deleteResourceFilesByTaskId = async (taskId) => {
    const [result] = await TaskManagementPool.execute(
        'DELETE FROM ResourceFiles WHERE task_id = ?',
        [taskId]
    );
    return result;
};
