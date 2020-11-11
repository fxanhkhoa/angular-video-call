"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const user_1 = __importDefault(require("../model/user"));
class UserController {
}
UserController.getMyProfile = async (req, res) => {
    try {
        const id = res.locals.jwtPayLoad.userId;
        const foundUser = await user_1.default.findById(id).select('-_id -password');
        res.status(http_status_codes_1.StatusCodes.OK).send(foundUser);
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
};
exports.default = UserController;
