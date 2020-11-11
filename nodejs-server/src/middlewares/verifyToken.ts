import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as jwt from "jsonwebtoken"
import { Config } from "../config/config";
import { ITokenParser } from "../model/tokenParse";
import User, { IUser } from "../model/user";

export default class TokenVerify {

    static checkJWT(req: Request, res: Response, next: NextFunction) {
        // console.log(req.headers.authorization)
        if (!req.headers.authorization){
            res.status(StatusCodes.UNAUTHORIZED).send()
        }
        const token = (req.headers.authorization as string).split(" ")[1];
        if (token === "null") {
            return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized request");
        }
        // * Get the userId here
        let payload = <ITokenParser>jwt.verify(token, Config.secretKey);
        if (!payload) {
            return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized request");
        }

        // * Set local payload
        res.locals.jwtPayLoad = payload
        next();
    }

    static checkROLE(roles: Array<string>) {
        return async (req: Request, res: Response, next: NextFunction) => {
            // Get User Id from previous middleware
            const id = (res.locals.jwtPayLoad as ITokenParser).userId

            // Get User role
            User.findById(id, (err, user) => {
                if (err) {
                    return res.status(StatusCodes.UNAUTHORIZED).send()
                }
                //Check if array of authorized roles includes the user's role
                if (roles.indexOf((user as IUser).role) > -1) next();
                else res.status(StatusCodes.UNAUTHORIZED).send();
            })
        }
    }
}
