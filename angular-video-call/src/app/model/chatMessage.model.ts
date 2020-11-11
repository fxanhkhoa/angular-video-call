import { WhoAmI } from './SocketIOInfo.model';

export interface IChatMessage {
    floatRight: boolean
    message: string
    sender: WhoAmI
}