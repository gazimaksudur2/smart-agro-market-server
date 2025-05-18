import express from 'express';
import regions from '../data/regions.js';

const router = express.Router();

router.get('', async(req, res)=>{
    res.status(200).json({success: true, data: regions});
});


export default router;