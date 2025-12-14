import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { VoteRequest } from '../types';

const router = Router();

// POST /api/vote
router.post('/', async (req: Request, res: Response) => {
  try {
    const { groupId, userId, slotIndex, optionId }: VoteRequest = req.body;

    if (!groupId || !userId || slotIndex === undefined || !optionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Upsert vote (update if exists, insert if not)
    await query(
      `INSERT INTO votes (id, group_id, user_id, slot_index, option_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (group_id, user_id, slot_index)
       DO UPDATE SET option_id = $5`,
      [uuidv4(), groupId, userId, slotIndex, optionId]
    );

    // Get updated vote counts for this slot
    const result = await query(
      `SELECT option_id, COUNT(*) as votes
       FROM votes
       WHERE group_id = $1 AND slot_index = $2
       GROUP BY option_id`,
      [groupId, slotIndex]
    );

    res.json({
      success: true,
      data: {
        votes: result.rows.reduce((acc, row) => {
          acc[row.option_id] = parseInt(row.votes);
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit vote',
    });
  }
});

// GET /api/votes/:groupId
router.get('/:groupId', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const result = await query(
      `SELECT slot_index, option_id, COUNT(*) as votes
       FROM votes
       WHERE group_id = $1
       GROUP BY slot_index, option_id`,
      [groupId]
    );

    // Organize votes by slot
    const votesBySlot: Record<number, Record<string, number>> = {};
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
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get votes',
    });
  }
});

// POST /api/groups - Create a new trip group
router.post('/groups', async (req: Request, res: Response) => {
  try {
    const { name, planId } = req.body;

    // Generate a 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const result = await query(
      `INSERT INTO trip_groups (id, name, code, plan_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [uuidv4(), name || 'Trip Group', code, planId]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create group',
    });
  }
});

// GET /api/groups/:code - Join a group by code
router.get('/groups/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const result = await query(
      `SELECT g.*, p.json_plan
       FROM trip_groups g
       LEFT JOIN plans p ON g.plan_id = p.id
       WHERE g.code = $1`,
      [code.toUpperCase()]
    );

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
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get group',
    });
  }
});

export default router;

