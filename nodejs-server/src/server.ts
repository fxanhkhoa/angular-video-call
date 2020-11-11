import express from "express"
import cors from "cors"
import * as http from "http";
import { Config } from "./config/config";
import mongoose from 'mongoose'
import bodyParser from "body-parser";
import { AuthenticationRoutes } from "./routes/authentication";
import { ISocketIOWhoAmI } from "./model/Interface/socketIODto";
import {v4 as uuidv4} from 'uuid'

export class Server {

    private app: express.Application;
    private server!: http.Server
    private io!: SocketIO.Server
    private port!: string | number
    private onlineUsers: ISocketIOWhoAmI[] = []

    private authenticationRoutes: AuthenticationRoutes = new AuthenticationRoutes()

    constructor() {
        this.app = express()
        this.app.use(cors())
        this.config()
        this.configRoute()
        this.listen()
    }

    private config(){
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.port = process.env.PORT || Config.port
        this.server = http.createServer(this.app)
        this.io = require('socket.io').listen(this.server, {origin: '*:*'})
        
        mongoose.connect(Config.dbConnectionString, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, (error) => {
            if (error) {
                throw("connect to mongodb error")
            }
            console.log('connect mongodb successfully!')
        })

        this.authenticationRoutes.route(this.app)
    }

    private configRoute() {
        this.app.get('/', (req, res) => {
            res.send('hello world!')
        })
        // this.app.get('/test', (req, res) => {
        //     this.io.emit('')
        // })
    }
    
    private listen() {
        this.server.listen(this.port, () => {
            console.log(`Running server on port ${this.port}`)
        })

        this.io.on('connect', socket => {
            console.log(`one connected: ${socket.id}`)
            // * Send all online users
            this.io.to(socket.id).emit('online-users', this.onlineUsers)

            // * Get Info Of User connected
            socket.on('I-connected', (data: ISocketIOWhoAmI) => {
                console.log(data)
                const foundUser = this.onlineUsers.find(elem => elem.email === data.email)
                if (foundUser) {
                    foundUser.peerId = data.peerId
                    foundUser.socketId = data.socketId
                } else {
                    this.onlineUsers.push(data)
                }
                socket.broadcast.emit('one-user-online', data)
            })

            // * Call someone 
            socket.on('Call-someone', (requester: ISocketIOWhoAmI, receiver: ISocketIOWhoAmI) => {
                console.log('Call-someone', requester, receiver)
                this.io.to(receiver.socketId).emit('request-calling', {requester, receiver})
            })

            // * Accept the call
            socket.on('Call-accept', (requester: ISocketIOWhoAmI, receiver: ISocketIOWhoAmI) => {
                console.log(`Call-accept`, requester, receiver)
                this.io.to(requester.socketId).emit('Call-accepted', {requester, receiver})
            })

            // * Create and join room
            socket.on('Create-and-join-room-and-notify-receiver', (requester: ISocketIOWhoAmI, receiver: ISocketIOWhoAmI) => {
                console.log(`Create-and-join-room-and-notify-receiver`, requester, receiver)
                const newRoomId = uuidv4()
                // * Notify sender the roomId
                this.io.to(requester.socketId).emit('notify-room-id', newRoomId)
                // * Notify receiver the roomId and join it
                this.io.to(receiver.socketId).emit('notify-room-id', newRoomId)
            })
            
            socket.on('call-now', (data: ISocketIOWhoAmI) => {
                console.log(`call-now`, data)
                socket.join(data.roomId)
                this.io.to(data.roomId).emit('one-join-call', data)
            })

            socket.on('global-mess', (sender: ISocketIOWhoAmI, message: string) => {
                this.io.emit('global-mess', {sender, message})
            })
            
            socket.on('room-mess', (sender: ISocketIOWhoAmI, message: string) => {
                this.io.to(sender.roomId).emit('room-mess', {sender, message})
            })

            socket.on('disconnect', () => {
                console.log(`user disconnected ${socket.id}`);
                this.onlineUsers = this.onlineUsers.filter(elem => elem.socketId !== socket.id)
                this.io.emit('one-disconnect', this.onlineUsers)
            });
        })
    }

    public getApp(): express.Application {
        return this.app;
    }
}