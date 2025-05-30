const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.insertTestReport = async (task_id, name, filename, filePath) => {
    const [result] = await TaskManagementPool.execute(
        'INSERT INTO TestReportsDocuments (task_id,fileName, report_file, path, creationTime) VALUES (?, ?, ?, ?, Now())',
        [task_id, name, filename, filePath]
    );
    return result;
};

exports.getTestReportsByTaskId = async (task_id) => {
    const [rows] = await TaskManagementPool.execute(
        'SELECT * FROM TestReportsDocuments WHERE task_id = ?',
        [task_id]
    );
    return rows;
};

exports.deleteTestReportsByTaskId = async (task_id) => {
    const [result] = await TaskManagementPool.execute(
        'DELETE FROM TestReportsDocuments WHERE task_id = ?',
        [task_id]
    );
    return result;
};
