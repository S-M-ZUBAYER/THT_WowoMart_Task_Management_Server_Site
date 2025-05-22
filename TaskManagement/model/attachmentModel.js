const path = require('path');
const fs = require('fs');
const TaskManagementPool = require('../../TaskManagementDb/config/db');

const executeQuery = async (query, params) => {
    const [rows] = await TaskManagementPool.execute(query, params);
    return rows; // This works for SELECT, but not INSERT!
};

const isImage = (filename) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
    return imageExtensions.includes(path.extname(filename).toLowerCase());
};

const attachmentModel = {

    getByDiscussionId: async (discussionId) => {
        const [rows] = await TaskManagementPool.execute(
            'SELECT * FROM DiscussionAttachment WHERE discussion_id = ?',
            [discussionId]
        );
        return rows;
    },

    createAttachment: (data) => {
        const query = `INSERT INTO DiscussionAttachment (discussion_id, discussion_files, discussion_images,path) VALUES (?, ?, ?, ?)`;
        const params = [
            data.discussion_id ?? null,
            data.discussion_files ?? null,
            data.discussion_images ?? null,
            data.path ? data.path : `https://grozziie.zjweiting.com:57683/tht/uploads/discussion_files/${data.discussion_images ? "discussion_images" : "discussion_files"}/`,
        ];
        return executeQuery(query, params);
    },

    deleteByIdAttachment: async (id) => {
        // 1. Get all matching rows for the id
        const attachments = await executeQuery(
            `SELECT discussion_files, discussion_images FROM DiscussionAttachment WHERE id = ?`,
            [id]
        );

        // 2. Process each row and delete files
        attachments.forEach((row) => {
            // Delete files
            if (row.discussion_files) {
                const files = row.discussion_files.split(',');
                files.forEach((filename) => {
                    const filePath = path.join(__dirname, '../uploads/discussion_files', filename.trim());
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file: ${filePath}`, err.message);
                        } else {
                            console.log(`Deleted file: ${filePath}`);
                        }
                    });
                });
            }

            // Delete images
            if (row.discussion_images) {
                const images = row.discussion_images.split(',');
                images.forEach((filename) => {
                    const imagePath = path.join(__dirname, '../uploads/discussion_images', filename.trim());
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error(`Error deleting image: ${imagePath}`, err.message);
                        } else {
                            console.log(`Deleted image: ${imagePath}`);
                        }
                    });
                });
            }
        });

        // 3. Delete rows from DB
        await executeQuery(
            `DELETE FROM DiscussionAttachment WHERE id = ?`,
            [id]
        );
    },

    deleteDiscussionIdAttachment: async (discussion_id) => {
        // 1. Get all matching rows for the discussion_id
        const attachments = await executeQuery(
            `SELECT discussion_files, discussion_images FROM DiscussionAttachment WHERE discussion_id = ?`,
            [discussion_id]
        );

        // 2. Process each row and delete files
        attachments.forEach((row) => {
            // Delete files
            if (row.discussion_files) {
                const files = row.discussion_files.split(',');
                files.forEach((filename) => {
                    const filePath = path.join(__dirname, '../uploads/discussion_files', filename.trim());
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file: ${filePath}`, err.message);
                        } else {
                            console.log(`Deleted file: ${filePath}`);
                        }
                    });
                });
            }

            // Delete images
            if (row.discussion_images) {
                const images = row.discussion_images.split(',');
                images.forEach((filename) => {
                    const imagePath = path.join(__dirname, '../uploads/discussion_images', filename.trim());
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error(`Error deleting image: ${imagePath}`, err.message);
                        } else {
                            console.log(`Deleted image: ${imagePath}`);
                        }
                    });
                });
            }
        });

        // 3. Delete rows from DB
        await executeQuery(
            `DELETE FROM DiscussionAttachment WHERE discussion_id = ?`,
            [discussion_id]
        );
    },
};

module.exports = attachmentModel;
