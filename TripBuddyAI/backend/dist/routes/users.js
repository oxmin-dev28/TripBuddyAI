"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// POST /api/users - Create or get user
router.post('/', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }
        // Try to find existing user
        let result = await (0, database_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // Create new user
            result = await (0, database_1.query)(`INSERT INTO users (id, email, name)
         VALUES ($1, $2, $3)
         RETURNING *`, [(0, uuid_1.v4)(), email, name || email.split('@')[0]]);
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user',
        });
    }
});
// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user',
        });
    }
});
// PUT /api/users/:id/preferences
router.put('/:id/preferences', async (req, res) => {
    try {
        const { id } = req.params;
        const preferences = req.body;
        const result = await (0, database_1.query)(`UPDATE users
       SET preferences = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`, [JSON.stringify(preferences), id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences',
        });
    }
});
// POST /api/users/:id/visits - Record a visit
router.post('/:id/visits', async (req, res) => {
    try {
        const { id } = req.params;
        const { placeId, rating } = req.body;
        if (!placeId) {
            return res.status(400).json({
                success: false,
                error: 'placeId is required',
            });
        }
        const result = await (0, database_1.query)(`INSERT INTO visits (id, user_id, place_id, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [(0, uuid_1.v4)(), id, placeId, rating || null]);
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Record visit error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record visit',
        });
    }
});
// GET /api/users/:id/visits
router.get('/:id/visits', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)(`SELECT * FROM visits WHERE user_id = $1 ORDER BY visited_at DESC`, [id]);
        res.json({
            success: true,
            data: result.rows,
        });
    }
    catch (error) {
        console.error('Get visits error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get visits',
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map