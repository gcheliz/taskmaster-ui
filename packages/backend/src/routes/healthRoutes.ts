import { Router } from 'express';
import { getHealth, getApiHealth, getSecretsHealth, getSystemHealth } from '../controllers/healthController';

const router = Router();

router.get('/health', getHealth);
router.get('/api/v1/health', getApiHealth);
router.get('/health/secrets', getSecretsHealth);
router.get('/health/system', getSystemHealth);

export default router;