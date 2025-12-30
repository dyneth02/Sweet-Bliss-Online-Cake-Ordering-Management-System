import express from 'express';
import VacationMode from '../models/VacationMode.js';

const router = express.Router();

// Get vacation mode status
router.get('/', async (req, res) => {
    try {
        let vacationMode = await VacationMode.findOne();
        if (!vacationMode) {
            vacationMode = await VacationMode.create({ isEnabled: false });
        }
        res.json({ success: true, isEnabled: vacationMode.isEnabled });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle vacation mode (admin only)
router.put('/', async (req, res) => {
    try {
        let vacationMode = await VacationMode.findOne();
        if (!vacationMode) {
            vacationMode = new VacationMode();
        }
        vacationMode.isEnabled = !vacationMode.isEnabled;
        await vacationMode.save();
        
        res.json({ success: true, isEnabled: vacationMode.isEnabled });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Simple status check endpoint for public access
router.get('/status', async (req, res) => {
    try {
        const vacationMode = await VacationMode.findOne();
        const isEnabled = vacationMode ? vacationMode.isEnabled : false;
        res.json({ isEnabled });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check vacation status' });
    }
});

export default router; 