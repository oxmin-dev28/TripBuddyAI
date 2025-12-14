"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const openai_1 = require("../services/openai");
const googlePlaces_1 = require("../services/googlePlaces");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// POST /api/generate-plan
router.post('/generate-plan', async (req, res) => {
    try {
        const { userId, location, preferences } = req.body;
        // Validate input
        if (!location || !preferences) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: location and preferences',
            });
        }
        // Fetch nearby places from Google Places API
        const [restaurants, attractions, museums] = await Promise.all([
            (0, googlePlaces_1.searchNearbyPlaces)({ location, type: 'restaurant', radius: 2000 }),
            (0, googlePlaces_1.searchNearbyPlaces)({ location, type: 'attraction', radius: 3000 }),
            (0, googlePlaces_1.searchNearbyPlaces)({ location, type: 'museum', radius: 3000 }),
        ]);
        const allPlaces = [...restaurants, ...attractions, ...museums];
        // Generate plan using OpenAI
        const days = await (0, openai_1.generateTripPlan)({
            preferences,
            location,
            nearbyPlaces: allPlaces,
        });
        // Create the trip plan object
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + preferences.days - 1);
        const plan = {
            id: (0, uuid_1.v4)(),
            userId: userId || 'anonymous',
            title: 'Моё путешествие',
            destination: location.city || preferences.countries[0] || 'Unknown',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            days,
            createdAt: new Date().toISOString(),
            status: 'active',
        };
        // Save to database if userId is provided
        if (userId && userId !== 'anonymous') {
            try {
                await (0, database_1.query)('INSERT INTO plans (id, user_id, json_plan) VALUES ($1, $2, $3)', [plan.id, userId, JSON.stringify(plan)]);
            }
            catch (dbError) {
                console.error('Database save error:', dbError);
                // Continue even if DB save fails
            }
        }
        res.json({
            success: true,
            data: { plan },
        });
    }
    catch (error) {
        console.error('Generate plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate plan',
        });
    }
});
// GET /api/plans/:id
router.get('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('SELECT json_plan FROM plans WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found',
            });
        }
        res.json({
            success: true,
            data: result.rows[0].json_plan,
        });
    }
    catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get plan',
        });
    }
});
// PUT /api/plans/:id
router.put('/plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const result = await (0, database_1.query)('UPDATE plans SET json_plan = json_plan || $1, updated_at = NOW() WHERE id = $2 RETURNING json_plan', [JSON.stringify(updates), id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found',
            });
        }
        res.json({
            success: true,
            data: result.rows[0].json_plan,
        });
    }
    catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update plan',
        });
    }
});
// GET /api/plans/user/:userId
router.get('/plans/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await (0, database_1.query)('SELECT json_plan FROM plans WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json({
            success: true,
            data: result.rows.map(row => row.json_plan),
        });
    }
    catch (error) {
        console.error('Get user plans error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get plans',
        });
    }
});
exports.default = router;
//# sourceMappingURL=plans.js.map