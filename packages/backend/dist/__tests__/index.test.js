"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Health endpoints', () => {
    it('should return health status', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('service', 'taskmaster-ui-backend');
        expect(response.body).toHaveProperty('timestamp');
    });
    it('should return API health status', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'API is running');
        expect(response.body).toHaveProperty('version', '1.0.0');
        expect(response.body).toHaveProperty('timestamp');
    });
    it('should return 404 for unknown routes', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/unknown-route');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
    });
});
//# sourceMappingURL=index.test.js.map