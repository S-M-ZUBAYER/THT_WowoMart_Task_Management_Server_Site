// const express = require('express');
// const app = express();
// app.use(express.json());

// // Routes
// const userRoutes = require('./wowomart/routes/userRoutes');
// const productRoutes = require('./TaskManagement/routes/productRoutes');

// // Mount routes
// app.use('/wowomart/users', userRoutes);
// app.use('/TaskManagement/products', productRoutes);



// // Start server
// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });



const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Increase the limit for JSON and URL-encoded payloads
app.use(bodyParser.json({ limit: '20mb' })); // Increase as needed
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

// Import DB pools
const wowomartPool = require('./wowomartDb/config/db');
const taskManagementPool = require('./TaskManagementDb/config/db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('🚀 Server booting...');

// ========== DB Test Connection ========== //
const testDBConnection = async (pool, name) => {
    try {
        console.log(`🔍 Testing ${name} DB connection...`);
        const connection = await pool.getConnection();
        console.log(`✅ [${name}] Database connected successfully.`);
        connection.release();
    } catch (err) {
        console.error(`❌ [${name}] Connection failed:`, err.message || err);
        throw err;
    }
};

// ========== DB Reconnect Logic ========== //
const reconnectDatabase = (pool, retries, name) => {
    return new Promise((resolve, reject) => {
        const attempt = (left) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    if (left <= 0) return reject(err);
                    console.warn(`⏳ [${name}] Retry ${6 - left}/5`);
                    return setTimeout(() => attempt(left - 1), 2000);
                }
                connection.release();
                resolve();
            });
        };
        attempt(retries);
    });
};

// ========== Middleware to check DB connection ========== //
const createDBCheckMiddleware = (pool, name) => {
    return (req, res, next) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error(`🔌 [${name}] DB disconnected. Attempting reconnect...`);
                reconnectDatabase(pool, 5, name)
                    .then(() => {
                        console.log(`✅ [${name}] Reconnected.`);
                        next();
                    })
                    .catch(() => {
                        console.error(`❌ [${name}] Reconnection failed.`);
                        return res.status(500).json({ error: `${name} DB unavailable.` });
                    });
            } else {
                connection.release();
                next();
            }
        });
    };
};

// ========== Load All Routes ========== //
const loadRoutesFromFolder = (app, folderPath, baseRoute, pool, poolName) => {
    const middleware = createDBCheckMiddleware(pool, poolName);
    const routesDir = path.join(__dirname, folderPath, 'routes');

    if (!fs.existsSync(routesDir)) {
        console.warn(`⚠️ No routes found for ${poolName} at ${routesDir}`);
        return;
    }

    fs.readdirSync(routesDir).forEach((file) => {
        if (file.endsWith('.js')) {
            const route = require(path.join(routesDir, file));
            const routePath = `/tht`;
            console.log(routePath);

            app.use(routePath, route);
            console.log(`✅ Route loaded: ${routePath}`);
        }
    });
};

// ========== Health Check Endpoints ========== //
app.get('/health/wowomart', async (req, res) => {
    try {
        const connection = await wowomartPool.getConnection();
        connection.release();
        res.status(200).json({ message: '✅ Wowomart DB is healthy' });
    } catch (error) {
        console.error('❌ Wowomart DB health check failed:', error.message || error);
        res.status(500).json({ error: 'Wowomart DB down' });
    }
});


app.get('/health/task', async (req, res) => {
    try {
        const connection = await taskManagementPool.getConnection();
        connection.release();
        res.status(200).json({ message: '✅ TaskManagement DB is healthy' });
    } catch (error) {
        console.error('❌ TaskManagement DB health check failed:', error.message || error);
        res.status(500).json({ error: 'TaskManagement DB down' });
    }
});

// ========== Global Error Handler ========== //
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.get('/', (req, res) => {
    res.status(200).json({
        message: '🚀 Server is running and both databases are connected successfully!',
        wowomart: '/wowomart/[your-routes]',
        taskManagement: '/TaskManagement/[your-routes]'
    });
});



// ========== Graceful Shutdown ========== //
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');

    try {
        await wowomartPool.end();
        console.log('✅ Wowomart DB pool closed.');
    } catch (err) {
        console.error('❌ Error closing Wowomart DB:', err.message);
    }

    try {
        await taskManagementPool.end();
        console.log('✅ TaskManagement DB pool closed.');
    } catch (err) {
        console.error('❌ Error closing TaskManagement DB:', err.message);
    }

    process.exit(0);
});

// ========== Start Server After DB Checks ========== //
Promise.all([
    testDBConnection(wowomartPool, 'Wowomart'),
    testDBConnection(taskManagementPool, 'TaskManagement')
])
    .then(() => {
        loadRoutesFromFolder(app, 'wowomart', '/wowomart', wowomartPool, 'Wowomart');
        loadRoutesFromFolder(app, 'TaskManagement', '/taskManagement', taskManagementPool, 'TaskManagement');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    })
    // .catch(() => {
    //     console.error('❌ One or more databases failed to connect. Server not started.');
    //     process.exit(1);
    // });
    .catch((err) => {
        console.error('❌ One or more databases failed to connect. Server not started.');
        console.error('🔍 Detailed error:', err); // <- This line shows the real issue
        process.exit(1);
    });


