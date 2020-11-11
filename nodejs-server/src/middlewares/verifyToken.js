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
const http_status_codes_1 = require("http-status-codes");
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = require("../config/config");
const user_1 = __importDefault(require("../model/user"));
class TokenVerify {
    static checkJWT(req, res, next) {
        // console.log(req.headers.authorization)
        if (!req.headers.authorization) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send();
        }
        const token = req.headers.authorization.split(" ")[1];
        if (token === "null") {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send("Unauthorized request");
        }
        // * Get the userId here
        let payload = jwt.verify(token, config_1.Config.secretKey);
        if (!payload) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send("Unauthorized request");
        }
        // * Set local payload
        res.locals.jwtPayLoad = payload;
        next();
    }
    static checkROLE(roles) {
        return async (req, res, next) => {
            // Get User Id from previous middleware
            const id = res.locals.jwtPayLoad.userId;
            // Get User role
            user_1.default.findById(id, (err, user) => {
                if (err) {
                    return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send();
                }
                //Check if array of authorized roles includes the user's role
                if (roles.indexOf(user.role) > -1)
                    next();
                else
                    res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send();
            });
        };
    }
}
exports.default = TokenVerify;
