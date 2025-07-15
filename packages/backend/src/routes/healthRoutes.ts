import { Router } from 'express';
import { getHealth, getApiHealth } from '../controllers/healthController';

const router = Router();

router.get('/health', getHealth);
router.get('/api/v1/health', getApiHealth);

export default router;