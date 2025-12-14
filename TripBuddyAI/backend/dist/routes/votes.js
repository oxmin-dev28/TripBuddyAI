"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// POST /api/vote
router.post('/', async (req, res) => {
    try {
        const { groupId, userId, slotIndex, optionId } = req.body;
        if (!groupId || !userId || slotIndex === undefined || !optionId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }
        // Upsert vote (update if exists, insert if not)
        await (0, database_1.query)(`INSERT INTO votes (id, group_id, user_id, slot_index, option_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (group_id, user_id, slot_index)
       DO UPDATE SET option_id = $5`, [(0, uuid_1.v4)(), groupId, userId, slotIndex, optionId]);
        // Get updated vote counts for this slot
        const result = await (0, database_1.query)(`SELECT option_id, COUNT(*) as votes
       FROM votes
       WHERE group_id = $1 AND slot_index = $2
       GROUP BY option_id`, [groupId, slotIndex]);
        res.json({
            success: true,
            data: {
                votes: result.rows.reduce((acc, row) => {
                    acc[row.option_id] = parseInt(row.votes);
                    return acc;
                }, {}),
            },
        });
    }
    catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit vote',
        });
    }
});
// GET /api/votes/:groupId
router.get('/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const result = await (0, database_1.query)(`SELECT slot_index, option_id, COUNT(*) as votes
       FROM votes
       WHERE group_id = $1
       GROUP BY slot_index, option_id`, [groupId]);
        // Organize votes by slot
        const votesBySlot = {};
        result.rows.forEach(row => {
            if (!votesBySlot[row.slot_index]) {
                votesBySlot[row.slot_index] = {};
            }
            votesBySlot[row.slot_index][row.option_id] = parseInt(row.votes);
        });
        res.json({
            success: true,
            data: votesBySlot,
        });
    }
    catch (error) {
        console.error('Get votes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get votes',
        });
    }
});
// POST /api/groups - Create a new trip group
router.post('/groups', async (req, res) => {
    try {
        const { name, planId } = req.body;
        // Generate a 6-character code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const result = await (0, database_1.query)(`INSERT INTO trip_groups (id, name, code, plan_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [(0, uuid_1.v4)(), name || 'Trip Group', code, planId]);
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create group',
        });
    }
});
// GET /api/groups/:code - Join a group by code
router.get('/groups/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await (0, database_1.query)(`SELECT g.*, p.json_plan
       FROM trip_groups g
       LEFT JOIN plans p ON g.plan_id = p.id
       WHERE g.code = $1`, [code.toUpperCase()]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Group not found',
            });
        }
        res.json({
            success: true,
            data: {
                group: result.rows[0],
                plan: result.rows[0].json_plan,
            },
        });
    }
    catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get group',
        });
    }
});
exports.default = router;
//# sourceMappingURL=votes.js.map