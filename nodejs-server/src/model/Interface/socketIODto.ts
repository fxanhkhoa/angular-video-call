import { Socket } from "socket.io";

export interface ISocketIOWhoAmI {
    socketId: string
    peerId: string
    email: string
    roomId: string
}