const express = require('express');
const redis = require('redis');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

const client = redis.createClient();

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.connect().then(() => {
    console.log('Connected to Redis');

    app.get('/', async (req, res) => {
        try {
            if (!req.cookies.visited) {
                const pageViews = await client.incr('page_views');
                res.cookie('visited', 'true', { maxAge: 24 * 60 * 60 * 1000 }); // Cookie expires in 1 day
                res.json({
                    message: 'Welcome to the homepage',
                    page_views: pageViews,
                });
            } else {
                res.json({
                    message: 'Welcome back!',
                });
            }
        } catch (err) {
            console.error('Error incrementing page views:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(err => {
    console.error('Failed to connect to Redis:', err);
});
