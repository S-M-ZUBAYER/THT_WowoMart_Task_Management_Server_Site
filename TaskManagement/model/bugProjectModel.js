const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.create = (data) => {
    const sql = 'INSERT INTO bugProject (bugProjectName) VALUES (?)';
    return TaskManagementPool.query(sql, [data.bugProjectName]);
};

exports.getAll = () => {
    const sql = 'SELECT * FROM bugProject';
    return TaskManagementPool.query(sql);
};

exports.getAllBugProjectsWithBugs = async () => {
    const [projects] = await TaskManagementPool.query(`
        SELECT * FROM bugProject
    `);

    const result = await Promise.all(projects.map(async (project) => {
        const [bugs] = await TaskManagementPool.query(`
            SELECT * FROM bugManagement WHERE bugProjectId = ?
        `, [project.id]);

        const bugsWithUsers = await Promise.all(bugs.map(async (bug) => {
            const assignWithIds = (bug.assignWith || '').split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id));

            let assignedUsers = [];
            if (assignWithIds.length > 0) {
                const [users] = await TaskManagementPool.query(
                    `SELECT id, name, email, role, designation, phone, joiningDate, image FROM users WHERE id IN (?)`,
                    [assignWithIds]
                );
                assignedUsers = users;
            }

            return {
                ...bug,
                assignWith: assignedUsers
            };
        }));

        return {
            id: project.id,
            bugProjectName: project.bugProjectName,
            bugs: bugsWithUsers
        };
    }));

    return result;
};

exports.getBugProjectWithBugsById = async (projectId) => {
    const [[project]] = await TaskManagementPool.query(`
        SELECT * FROM bugProject WHERE id = ?
    `, [projectId]);

    if (!project) return null;

    const [bugs] = await TaskManagementPool.query(`
        SELECT * FROM bugManagement WHERE bugProjectId = ?
    `, [projectId]);

    const bugsWithUsers = await Promise.all(bugs.map(async (bug) => {
        const assignWithIds = (bug.assignWith || '').split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));

        let assignedUsers = [];
        if (assignWithIds.length > 0) {
            const [users] = await TaskManagementPool.query(
                `SELECT id, name, email, role, designation, phone, joiningDate, image FROM users WHERE id IN (?)`,
                [assignWithIds]
            );
            assignedUsers = users;
        }

        return {
            ...bug,
            assignWith: assignedUsers
        };
    }));

    return {
        id: project.id,
        bugProjectName: project.bugProjectName,
        bugs: bugsWithUsers
    };
};

exports.deleteProjectAndRelatedBugs = async (id) => {
    const sql1 = 'DELETE FROM bugManagement WHERE bugProjectId = ?';
    const sql2 = 'DELETE FROM bugProject WHERE id = ?';

    // Execute queries sequentially and wait for each to complete
    const deleteBugs = await TaskManagementPool.query(sql1, [id]);
    const deleteProject = await TaskManagementPool.query(sql2, [id]);

    return { deleteBugs, deleteProject };
};

exports.updateProjectName = (id, data) => {
    const sql = 'UPDATE bugProject SET ? WHERE id = ?';
    return TaskManagementPool.query(sql, [data, id]);
};
