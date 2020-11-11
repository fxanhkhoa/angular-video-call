"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
const user_1 = __importDefault(require("../model/user"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = require("../config/config");
class AuthenticationController {
}
AuthenticationController.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email, password)
        const hashDisgest = crypto.createHash('sha256').update(password).digest('base64');
        const foundUser = await user_1.default.findOne({ email });
        // console.log(foundUser)
        if (!foundUser) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).send();
        }
        else {
            const validPassword = (hashDisgest === foundUser.password);
            if (validPassword) {
                const token = jwt.sign({ userId: foundUser._id, email: foundUser.email }, config_1.Config.secretKey, {
                    expiresIn: config_1.Config.tokenExpiredTime
                });
                res.status(http_status_codes_1.StatusCodes.OK).send({ result: true, token });
            }
            else {
                res.status(http_status_codes_1.StatusCodes.OK).send({ result: false });
            }
        }
    }
    catch (error) {
        console.log(`login api error: ${error}`);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
};
AuthenticationController.signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await user_1.default.findOne({ email });
        if (foundUser) {
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).send();
        }
        else {
            const hashDisgest = crypto.createHash('sha256').update(password).digest('base64');
            const createdUser = await user_1.default.create({
                email,
                password: hashDisgest,
                role: 'user'
            });
            createdUser.password = '';
            if (createdUser) {
                res.status(http_status_codes_1.StatusCodes.CREATED).send(createdUser);
            }
            else {
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send();
            }
        }
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
};
AuthenticationController.getRole = async (req, res) => {
    try {
        // console.log(res.locals)
        const foundUser = await user_1.default.findById(res.locals.jwtPayLoad.userId);
        res.status(http_status_codes_1.StatusCodes.OK).send({ role: foundUser.role });
    }
    catch (error) {
        // console.log(error)
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
};
exports.default = AuthenticationController;
