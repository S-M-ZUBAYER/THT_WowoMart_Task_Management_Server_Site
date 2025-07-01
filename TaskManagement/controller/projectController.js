const path = require('path');
const fs = require('fs');
const { projectCreateSchema } = require('../schemas/projectSchema');
const ProjectModel = require('../model/projectModel');
const { default: axios } = require('axios');

// Create project with multiple resource files
exports.createProject = async (req, res) => {
    try {
        const { error, value } = projectCreateSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const assignWithString = value.assign_with_ids.join(',');

        const newProject = {
            ...value,
            assign_with_ids: assignWithString
        };

        const result = await ProjectModel.createProject(newProject);
        const projectId = result.insertId;

        // Handle file uploads (assumes req.files exists, use multer)
        const uploadedFiles = req.files || [];
        for (const file of uploadedFiles) {
            // const fileUrl = `https://grozziie.zjweiting.com:57683/tht/uploads/project_resources/${file.filename}`;
            const fileUrl = `https://grozziie.zjweiting.com:57683/tht/uploads/project_resources_files/${file.filename}`;
            await ProjectModel.saveResourceFile(projectId, file.originalname, fileUrl);
        }

        res.status(201).json({
            status: 201,
            message: 'Project created successfully',
            result: { project_id: projectId }
        });

    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Get project basic info
        const project = await ProjectModel.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ status: 404, message: 'Project not found with this ID' });
        }

        // Get assigned employee info
        let assignedEmployees = [];
        if (project.assign_with_ids) {
            const userIds = project.assign_with_ids
                .split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id));

            assignedEmployees = await ProjectModel.getUsersByIds(userIds);
        }

        // Get uploaded resource files
        const resourceFiles = await ProjectModel.getProjectFilesById(projectId);

        res.status(200).json({
            status: 200,
            message: 'Project details retrieved successfully',
            data: {
                projectInfo: {
                    ...project,
                    assign_with_ids: assignedEmployees
                },
                resourceFiles: resourceFiles.map(file => ({
                    ...file,
                    fileName: file.file_name,
                }))
            }
        });

    } catch (err) {
        console.error('❌ Error fetching project by ID:', err);
        res.status(500).json({ status: 500, message: 'Server error', error: err.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        // Fetch all projects
        const allProjects = await ProjectModel.getAllProjects();
        if (!allProjects || allProjects.length === 0) {
            return res.status(404).json({ status: 404, message: 'No projects found', data: [] });
        }

        // Prepare detailed project data
        const detailedProjects = await Promise.all(
            allProjects.map(async (project) => {
                // Assigned employees
                let assignedEmployees = [];
                if (project.assign_with_ids) {
                    const userIds = project.assign_with_ids
                        .split(',')
                        .map(id => parseInt(id.trim()))
                        .filter(id => !isNaN(id));
                    assignedEmployees = await ProjectModel.getUsersByIds(userIds);
                }

                // Resource files
                const resourceFiles = await ProjectModel.getProjectFilesById(project.id);

                return {
                    projectInfo: {
                        ...project,
                        assign_with_ids: assignedEmployees
                    },
                    resourceFiles: resourceFiles.map(file => ({
                        ...file,
                        fileName: file.file_name,
                    }))
                };
            })
        );

        res.status(200).json({
            status: 200,
            message: 'All projects retrieved successfully',
            data: detailedProjects
        });
    } catch (error) {
        console.error('❌ Error fetching all projects:', error);
        res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
    }
};

exports.updateProjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { project_status } = req.body;

        if (!project_status) {
            return res.status(400).json({
                status: 400,
                message: 'project_status is required'
            });
        }

        const result = await ProjectModel.updateProjectStatus(id, project_status);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Project not found or status not changed'
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Project status updated successfully'
        });

    } catch (err) {
        console.error('❌ Error updating project status:', err);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: err.message
        });
    }
};

exports.updateProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            project_name,
            project_requirements,
            project_startDate,
            project_endDate,
            project_status,
            assign_with_ids
        } = req.body;

        // Basic validation
        if (!project_name || !project_status || !assign_with_ids || !Array.isArray(assign_with_ids)) {
            return res.status(400).json({
                status: 400,
                message: 'Required fields missing or invalid format'
            });
        }

        // Convert array of IDs to comma-separated string
        const assignWithIdsString = assign_with_ids.join(',');

        const updateData = {
            project_name,
            project_requirements,
            project_startDate,
            project_endDate,
            project_status,
            assign_with_ids: assignWithIdsString
        };

        const result = await ProjectModel.updateProjectById(id, updateData);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Project not found or data not updated'
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Project updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating project:', error);
        res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
    }
};

exports.uploadProjectResourceFiles = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: 400, message: 'No files uploaded' });
        }

        const uploadPromises = req.files.map(file => {
            const fileUrl = `http://localhost:5000/tht/uploads/project_resources_files/${file.filename}`;
            return ProjectModel.insertProjectResourceFile(projectId, file.filename, fileUrl);
        });

        await Promise.all(uploadPromises);

        res.status(201).json({
            status: 201,
            message: 'Resource files uploaded successfully',
            uploadedCount: req.files.length
        });
    } catch (error) {
        console.error('❌ Error uploading resource files:', error);
        res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.deleteProjectResourceFileById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get the file URL from DB
        const fileData = await ProjectModel.getProjectFileById(id);

        if (!fileData || !fileData.file_url) {
            return res.status(404).json({ status: 404, message: 'File not found' });
        }

        // Extract filename
        const fileName = fileData.file_url.replace('http://localhost:5000/tht/uploads/project_resources_files/', '');
        const filePath = path.join(__dirname, '../uploads/project_resources_files', fileName);

        // Delete file from disk
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Deleted file: ${filePath}`);
        }

        // Delete from DB
        const result = await ProjectModel.deleteProjectFileById(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'File record not deleted from database' });
        }

        res.status(200).json({ status: 200, message: 'File deleted successfully' });

    } catch (err) {
        console.error('❌ Error deleting file:', err);
        res.status(500).json({ status: 500, message: 'Server error', error: err.message });
    }
};

exports.deleteProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;

        // 🧠 1. Get project name
        const ProjectDetailsResult = await ProjectModel.getProjectName(projectId);
        const projectName = ProjectDetailsResult.project_name;

        // 🧠 2. Get all task IDs under the project
        const allTaskIdsUnderProject = await ProjectModel.getAllTaskIdsUnderProjectName(projectName);

        // 🔁 3. Call delete-task API for each task
        for (const task of allTaskIdsUnderProject) {
            try {
                const response = await axios.post('https://grozziie.zjweiting.com:57683/tht/taskManagement/api/delete-task', {
                    task_id: task.id,
                    projectName: task.task_title
                });

                if (response.status !== 200) {
                    return res.status(500).json({
                        status: 500,
                        message: `❌ Failed to delete task with ID: ${task.id}`,
                        error: response.data
                    });
                }

                console.log(`✅ Task ID ${task.id} deleted successfully`);

            } catch (err) {
                console.error(`❌ Error deleting task with ID ${task.id}:`, err.response?.data || err.message);
                return res.status(500).json({
                    status: 500,
                    message: `❌ Error deleting task with ID ${task.id}`,
                    error: err.response?.data || err.message
                });
            }
        }

        // ✅ 4. Delete files from server
        const files = await ProjectModel.getProjectFilesById(projectId);
        for (const file of files) {
            const fileName = file.file_url.replace('https://grozziie.zjweiting.com:57683/tht/uploads/project_resources_files/', '');
            const filePath = path.join(__dirname, '../uploads/project_resources_files', fileName);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`✅ Deleted file: ${filePath}`);
            }
        }

        // ✅ 5. Delete project files from DB
        await ProjectModel.deleteProjectFilesByProjectId(projectId);

        // ✅ 6. Delete project record from DB
        const deleteResult = await ProjectModel.deleteProjectById(projectId);

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'Project not found' });
        }

        // 🎉 7. Done
        res.status(200).json({ status: 200, message: 'Project, related tasks, and files deleted successfully' });

    } catch (err) {
        console.error('❌ Error deleting project:', err);
        res.status(500).json({ status: 500, message: 'Server error', error: err.message });
    }
};