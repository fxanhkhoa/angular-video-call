import { Application, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ITokenParser } from "../model/tokenParse";
import User from "../model/user";

class UserController {
    static getMyProfile = async (req: Request, res: Response) => {
        try {
            const id = (res.locals.jwtPayLoad as ITokenParser).userId

            const foundUser = await User.findById(id).select('-_id -password')
            res.status(StatusCodes.OK).send(foundUser)    
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()            
        }
    }
}

export default UserController