// const TaskManagementPool = require('../../TaskManagementDb/config/db');
// const executeQuery = async (query, params) => {
//     const [rows] = await TaskManagementPool.execute(query, params);
//     return rows; // This works for SELECT, but not INSERT!
// };
// const attachmentModel = {
//     createAttachment: (data) => {
//         const query = `INSERT INTO DiscussionAttachment (discussion_id, discussion_files, discussion_images) VALUES (?, ?, ?)`;
//         const params = [
//             data.discussion_id,
//             data.discussion_files,
//             data.discussion_images
//         ];
//         return executeQuery(query, params);
//     },

//     updateAttachment: (id, data) => {
//         const query = `UPDATE DiscussionAttachment SET discussion_files=?, discussion_images=? WHERE id=?`;
//         const params = [
//             data.discussion_files,
//             data.discussion_images,
//             id
//         ];
//         return executeQuery(query, params);
//     },

//     deleteAttachment: (id) => executeQuery(`DELETE FROM DiscussionAttachment WHERE id = ?`, [id])
// };

// module.exports = attachmentModel;
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
            data.path ? data.path : "http://localhost:5000/tht/taskManagement/api/",
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

    // deleteDiscussionIdAttachment: async (discussion_id) => {
    //     // 1. Get all attachments for the discussion_id
    //     const attachments = await executeQuery(
    //         `SELECT file_path FROM DiscussionAttachment WHERE discussion_id = ?`,
    //         [discussion_id]
    //     );

    //     // 2. Delete each file based on type
    //     attachments.forEach((attachment) => {
    //         const filename = path.basename(attachment.file_path); // extract filename only

    //         // Determine the correct folder
    //         const folder = isImage(filename)
    //             ? '../uploads/discussion_images'
    //             : '../uploads/discussion_files';

    //         const filePath = path.join(__dirname, folder, filename);

    //         // Delete the file
    //         fs.unlink(filePath, (err) => {
    //             if (err) {
    //                 console.error(`Error deleting file: ${filePath}`, err);
    //             } else {
    //                 console.log(`Deleted file: ${filePath}`);
    //             }
    //         });
    //     });

    //     // 3. Delete DB records
    //     await executeQuery(
    //         `DELETE FROM DiscussionAttachment WHERE discussion_id = ?`,
    //         [discussion_id]
    //     );
    // },

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
