const TaskManagementPool = require('../../TaskManagementDb/config/db');

// Create new bug project
exports.create = (data) => {
    const sql = 'INSERT INTO bugProject (bugProjectName) VALUES (?)';
    return TaskManagementPool.query(sql, [data.bugProjectName]);
};

// Get all bug projects
exports.getAll = () => {
    const sql = 'SELECT * FROM bugProject';
    return TaskManagementPool.query(sql);
};
// Get all bug projects with related bugs grouped in an array

exports.getAllBugProjectsWithBugs = async () => {
    const [projects] = await TaskManagementPool.query(`
        SELECT * FROM bugProject
    `);

    const result = await Promise.all(projects.map(async (project) => {
        const [bugs] = await TaskManagementPool.query(`
            SELECT * FROM bugManagement WHERE bugProjectId = ?
        `, [project.id]);

        return {
            id: project.id,
            bugProjectName: project.bugProjectName,
            bugs: bugs || []
        };
    }));

    return result;
};


// Delete from bugManagement first, then from bugProject
exports.deleteProjectAndRelatedBugs = async (id) => {
    const sql1 = 'DELETE FROM bugManagement WHERE bugProjectId = ?';
    const sql2 = 'DELETE FROM bugProject WHERE id = ?';

    // Execute queries sequentially and wait for each to complete
    const deleteBugs = await TaskManagementPool.query(sql1, [id]);
    const deleteProject = await TaskManagementPool.query(sql2, [id]);

    return { deleteBugs, deleteProject };
};


// Update bugProjectName
exports.updateProjectName = (id, data) => {
    const sql = 'UPDATE bugProject SET ? WHERE id = ?';
    return TaskManagementPool.query(sql, [data, id]);
};
