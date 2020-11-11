import { Application, Request, Response } from "express";
import * as crypto from "crypto"
import User, { IUser } from "../model/user";
import {StatusCodes} from 'http-status-codes'
import AuthenticationController from "../controllers/authenticationController";
import TokenVerify from "../middlewares/verifyToken";

export class AuthenticationRoutes {
    public route(app: Application) {
        app.post('/api/login', AuthenticationController.login)

        app.post('/api/signup', AuthenticationController.signup)

        app.get('/api/role', [TokenVerify.checkJWT], AuthenticationController.getRole)

        app.get('/api/test', (req: Request, res: Response) => {
            res.status(StatusCodes.ACCEPTED).send("OK")
        })
    }
}