const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.createProject = async (data) => {
    const query = `
        INSERT INTO ProjectInfo 
        (project_name, project_requirements, project_startDate, project_endDate, project_status, assign_with_ids)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
        data.project_name,
        data.project_requirements,
        data.project_startDate,
        data.project_endDate || null, // ✅ Ensure null if undefined
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

exports.getProjectName = async (projectId) => {
    const [rows] = await TaskManagementPool.query(`SELECT project_name FROM projectInfo WHERE id = ?`, [projectId]);
    return rows[0];
};

exports.getAllTaskIdsUnderProjectName = async (project_name) => {
    const [rows] = await TaskManagementPool.query(`SELECT id, task_title FROM taskfullinfo WHERE project_name = ?`, [project_name]);
    return rows;
};

exports.getProjectFilesById = async (projectId) => {
    const [rows] = await TaskManagementPool.query(`SELECT file_url, file_name FROM ProjectResourceFiles WHERE project_id = ?`, [projectId]);
    return rows;
};

exports.deleteProjectFilesByProjectId = async (projectId) => {
    await TaskManagementPool.query(`DELETE FROM ProjectResourceFiles WHERE project_id = ?`, [projectId]);
};

exports.deleteProjectById = async (projectId) => {
    const [result] = await TaskManagementPool.query(`DELETE FROM ProjectInfo WHERE id = ?`, [projectId]);
    return result;
};

exports.getProjectById = async (projectId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM ProjectInfo WHERE id = ?`, [projectId]);
    return rows[0];
};

exports.getUsersByIds = async (ids) => {
    if (!ids.length) return [];
    const [rows] = await TaskManagementPool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);
    return rows;
};

exports.updateProjectStatus = async (id, status) => {
    const query = `UPDATE ProjectInfo SET project_status = ? WHERE id = ?`;
    const [result] = await TaskManagementPool.execute(query, [status, id]);
    return result;
};

exports.updateProjectById = async (id, data) => {
    const sql = `
        UPDATE ProjectInfo
        SET project_name = ?, 
            project_requirements = ?, 
            project_startDate = ?, 
            project_endDate = ?, 
            project_status = ?, 
            assign_with_ids = ?
        WHERE id = ?
    `;

    const params = [
        data.project_name,
        data.project_requirements,
        data.project_startDate,
        data.project_endDate,
        data.project_status,
        data.assign_with_ids,
        id
    ];

    const [result] = await TaskManagementPool.execute(sql, params);
    return result;
};

exports.getProjectFileById = async (id) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM projectresourcefiles WHERE id = ?`, [id]);
    return rows[0];
};

exports.insertProjectResourceFile = async (projectId, fileName, fileUrl) => {
    const sql = `INSERT INTO projectresourcefiles (project_id, file_name, file_url) VALUES (?, ?, ?)`;
    const [result] = await TaskManagementPool.execute(sql, [projectId, fileName, fileUrl]);
    return result;
};

exports.deleteProjectFileById = async (id) => {
    const [result] = await TaskManagementPool.execute(`DELETE FROM projectresourcefiles WHERE id = ?`, [id]);
    return result;
};



