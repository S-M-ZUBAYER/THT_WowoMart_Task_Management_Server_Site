const path = require('path');
const fs = require('fs');
const { projectCreateSchema } = require('../schemas/projectSchema');
const ProjectModel = require('../model/projectModel');

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
            const fileUrl = `http://localhost:5000/tht/uploads/project_resources_files/${file.filename}`;
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

exports.deleteProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Get project resource files (file names or full URLs)
        const files = await ProjectModel.getProjectFilesById(projectId);
        console.log(files, "files");


        // Delete files from server
        for (const file of files) {
            console.log(file.file_name, "resource_file");

            // const fileName = file.resource_file.replace('http://localhost:5000/tht/uploads/project_resources_files/', '');
            const filePath = path.join(__dirname, '../uploads/project_resources_files', file.file_name);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`✅ Deleted file: ${filePath}`);
            }
        }

        // Delete DB rows (files + project)
        await ProjectModel.deleteProjectFilesByProjectId(projectId);
        const deleteResult = await ProjectModel.deleteProjectById(projectId);

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'Project not found' });
        }

        res.status(200).json({ status: 200, message: 'Project and files deleted successfully' });

    } catch (err) {
        console.error('❌ Error deleting project:', err);
        res.status(500).json({ status: 500, message: 'Server error', error: err.message });
    }
};
