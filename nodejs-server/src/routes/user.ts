import { Application, Request, Response } from "express";
import * as crypto from "crypto"
import User, { IUser } from "../model/user";
import {StatusCodes} from 'http-status-codes'
import AuthenticationController from "../controllers/authenticationController";
import UserController from "../controllers/userController";
import TokenVerify from "../middlewares/verifyToken";

export class UserRoutes {
    public route(app: Application) {
        app.get('/api/me', [TokenVerify.checkJWT, TokenVerify.checkROLE(["user"])] ,UserController.getMyProfile)
    }
}