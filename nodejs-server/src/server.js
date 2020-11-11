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
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http = __importStar(require("http"));
const config_1 = require("./config/config");
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const authentication_1 = require("./routes/authentication");
const uuid_1 = require("uuid");
class Server {
    constructor() {
        this.onlineUsers = [];
        this.authenticationRoutes = new authentication_1.AuthenticationRoutes();
        this.app = express_1.default();
        this.app.use(cors_1.default());
        this.config();
        this.configRoute();
        this.listen();
    }
    config() {
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
        this.port = process.env.PORT || config_1.Config.port;
        this.server = http.createServer(this.app);
        this.io = require('socket.io').listen(this.server, { origin: '*:*' });
        mongoose_1.default.connect(config_1.Config.dbConnectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, (error) => {
            if (error) {
                throw ("connect to mongodb error");
            }
            console.log('connect mongodb successfully!');
        });
        this.authenticationRoutes.route(this.app);
    }
    configRoute() {
        this.app.get('/', (req, res) => {
            res.send('hello world!');
        });
        // this.app.get('/test', (req, res) => {
        //     this.io.emit('')
        // })
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log(`Running server on port ${this.port}`);
        });
        this.io.on('connect', socket => {
            console.log(`one connected: ${socket.id}`);
            // * Send all online users
            this.io.to(socket.id).emit('online-users', this.onlineUsers);
            // * Get Info Of User connected
            socket.on('I-connected', (data) => {
                console.log(data);
                const foundUser = this.onlineUsers.find(elem => elem.email === data.email);
                if (foundUser) {
                    foundUser.peerId = data.peerId;
                    foundUser.socketId = data.socketId;
                }
                else {
                    this.onlineUsers.push(data);
                }
                socket.broadcast.emit('one-user-online', data);
            });
            // * Call someone 
            socket.on('Call-someone', (requester, receiver) => {
                console.log('Call-someone', requester, receiver);
                this.io.to(receiver.socketId).emit('request-calling', { requester, receiver });
            });
            // * Accept the call
            socket.on('Call-accept', (requester, receiver) => {
                console.log(`Call-accept`, requester, receiver);
                this.io.to(requester.socketId).emit('Call-accepted', { requester, receiver });
            });
            // * Create and join room
            socket.on('Create-and-join-room-and-notify-receiver', (requester, receiver) => {
                console.log(`Create-and-join-room-and-notify-receiver`, requester, receiver);
                const newRoomId = uuid_1.v4();
                // * Notify sender the roomId
                this.io.to(requester.socketId).emit('notify-room-id', newRoomId);
                // * Notify receiver the roomId and join it
                this.io.to(receiver.socketId).emit('notify-room-id', newRoomId);
            });
            socket.on('call-now', (data) => {
                console.log(`call-now`, data);
                socket.join(data.roomId);
                this.io.to(data.roomId).emit('one-join-call', data);
            });
            socket.on('global-mess', (sender, message) => {
                this.io.emit('global-mess', { sender, message });
            });
            socket.on('room-mess', (sender, message) => {
                this.io.to(sender.roomId).emit('room-mess', { sender, message });
            });
            socket.on('disconnect', () => {
                console.log(`user disconnected ${socket.id}`);
                this.onlineUsers = this.onlineUsers.filter(elem => elem.socketId !== socket.id);
                this.io.emit('one-disconnect', this.onlineUsers);
            });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.Server = Server;
