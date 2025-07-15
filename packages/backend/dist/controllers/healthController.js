"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiHealth = exports.getHealth = void 0;
const getHealth = (req, res) => {
    const response = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'taskmaster-ui-backend',
    };
    res.status(200).json(response);
};
exports.getHealth = getHealth;
const getApiHealth = (req, res) => {
    const response = {
        status: 'API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        service: 'taskmaster-ui-backend',
    };
    res.status(200).json(response);
};
exports.getApiHealth = getApiHealth;
//# sourceMappingURL=healthController.js.map