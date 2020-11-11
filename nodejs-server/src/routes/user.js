"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const userController_1 = __importDefault(require("../controllers/userController"));
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
class UserRoutes {
    route(app) {
        app.get('/api/me', [verifyToken_1.default.checkJWT, verifyToken_1.default.checkROLE(["user"])], userController_1.default.getMyProfile);
    }
}
exports.UserRoutes = UserRoutes;
