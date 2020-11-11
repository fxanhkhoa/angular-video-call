import { Application, Request, Response } from "express";
import * as crypto from "crypto"
import * as jwt from "jsonwebtoken"
import User, { IUser } from "../model/user";
import {StatusCodes} from 'http-status-codes'
import { Config } from "../config/config";
import { ITokenParser } from "../model/tokenParse";


class AuthenticationController {
    static login = async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body
            // console.log(email, password)
            const hashDisgest = crypto.createHash('sha256').update(password).digest('base64')
            const foundUser = await User.findOne({email})
            // console.log(foundUser)
            if (!foundUser){
                return res.status(StatusCodes.NOT_FOUND).send()
            } else {
                const validPassword = (hashDisgest === (foundUser as IUser).password)
                if (validPassword) {
                    const token = jwt.sign(
                        {userId: (foundUser as unknown as IUser)._id, email: (foundUser as unknown as IUser).email},
                        Config.secretKey,
                        {
                            expiresIn: Config.tokenExpiredTime
                        }
                    )
                    res.status(StatusCodes.OK).send({result: true, token})
                } else {
                    res.status(StatusCodes.OK).send({result: false})
                }
            }
        } catch (error) {
            console.log(`login api error: ${error}`)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()        
        }
    }

    static signup = async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body
            const foundUser = await User.findOne({email})
            if (foundUser){
                return res.status(StatusCodes.CONFLICT).send()
            } else {
                const hashDisgest = crypto.createHash('sha256').update(password).digest('base64')
                const createdUser = await User.create({
                    email,
                    password: hashDisgest,
                    role: 'user'
                })
                createdUser.password = ''
                if (createdUser) {
                    res.status(StatusCodes.CREATED).send(createdUser)
                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
                }
            }
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
        }
    }

    static getRole = async (req: Request, res: Response) => {
        try {
            // console.log(res.locals)
            const foundUser = await User.findById((res.locals.jwtPayLoad as ITokenParser).userId)

            res.status(StatusCodes.OK).send({role: (foundUser as IUser).role})
        } catch (error) {
            // console.log(error)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
        }
    }
}

export default AuthenticationController