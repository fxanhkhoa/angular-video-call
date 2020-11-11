"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationRoutes = void 0;
const http_status_codes_1 = require("http-status-codes");
const authenticationController_1 = __importDefault(require("../controllers/authenticationController"));
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
class AuthenticationRoutes {
    route(app) {
        app.post('/api/login', authenticationController_1.default.login);
        app.post('/api/signup', authenticationController_1.default.signup);
        app.get('/api/role', [verifyToken_1.default.checkJWT], authenticationController_1.default.getRole);
        app.get('/api/test', (req, res) => {
            res.status(http_status_codes_1.StatusCodes.ACCEPTED).send("OK");
        });
    }
}
exports.AuthenticationRoutes = AuthenticationRoutes;
