const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.createProject = async (data) => {
    const query = `
        INSERT INTO ProjectInfo (project_name, project_requirements, project_startDate, project_endDate, project_status, assign_with_ids)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
        data.project_name,
        data.project_requirements,
        data.project_startDate,
        data.project_endDate,
        data.project_status,
        data.assign_with_ids
    ];
    const [result] = await TaskManagementPool.execute(query, params);
    return result;
};

exports.saveResourceFile = async (projectId, fileName, fileUrl) => {
    const query = `INSERT INTO ProjectResourceFiles (project_id, file_name, file_url) VALUES (?, ?, ?)`;
    await TaskManagementPool.execute(query, [projectId, fileName, fileUrl]);
};

exports.getAllProjects = async () => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM ProjectInfo`);
    return rows;
};

exports.getProjectFiles = async (projectId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM ProjectResourceFiles WHERE project_id = ?`, [projectId]);
    return rows;
};

exports.getProjectFilesById = async (projectId) => {
    const [rows] = await TaskManagementPool.query(`SELECT file_name FROM ProjectResourceFiles WHERE project_id = ?`, [projectId]);
    return rows;
};

exports.deleteProjectFilesByProjectId = async (projectId) => {
    await TaskManagementPool.query(`DELETE FROM ProjectResourceFiles WHERE project_id = ?`, [projectId]);
};

exports.deleteProjectById = async (projectId) => {
    const [result] = await TaskManagementPool.query(`DELETE FROM ProjectInfo WHERE id = ?`, [projectId]);
    return result;
};