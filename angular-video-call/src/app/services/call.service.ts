import { Injectable, OnDestroy } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { WhoAmI } from '../model/SocketIOInfo.model';
import { map, take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import Peer from 'peerjs';

@Injectable({
  providedIn: 'root'
})
export class CallService implements OnDestroy{

  // Peer Object 
  peer
  // Peer Id of Me
  mypeerid = new BehaviorSubject<string>(null)
  // Video Of Me
  myStream = new BehaviorSubject(null)
  // Room I Join to
  roomId = new BehaviorSubject<string>(null)
  // My Socket IO Object
  mySocket: Socket
  // My Socket Id
  mysocketid = new BehaviorSubject<string>(null)
  // Users are oline now
  onlineUsers = new BehaviorSubject<WhoAmI[]>([])
  // My streams of friends is connected in room
  friendStream = []
  // My Infomation Object
  whoAmI: WhoAmI

  // Destroy Subject
  $ngDestroy = new Subject()

  constructor(
    socket: Socket
  ) { 
    this.peer = new Peer(undefined, {
      host: 'peerjs-server.herokuapp.com',
      secure: true
    })
    this.mySocket = socket
    this.mySocket.connect()

    this.mySocket.on('connect', () => {
      this.mysocketid.next(this.mySocket.ioSocket.id)
    })

    this.peer.on('open', (id: string) => {
      // console.log(`My peer id: ${id}`)
      this.mypeerid.next(id)
    })

    this.getOnlineUsers()
    .pipe(takeUntil(this.$ngDestroy))
    .subscribe(
      res => {
        console.log('online-users', res)
        this.onlineUsers.next(res)
      }
    )

    this.getDisconnectedUser()
    .pipe(takeUntil(this.$ngDestroy))
    .subscribe(
      res => {
        console.log('disconnect-user', res)
        this.onlineUsers.next(res)
      }
    )

    this.getUserJustOnline()
    .pipe(takeUntil(this.$ngDestroy))
    .subscribe(
      res => {
        console.log('one-user-online', res)
        this.onlineUsers
        .pipe(take(1))
        .subscribe(
          res1 => {
            res1.push(res)
            this.onlineUsers.next(res1)
          }
        )
      }
    )

    this.getNotifyRoomId()
    .pipe(takeUntil(this.$ngDestroy))
    .subscribe(
      res => {
        this.roomId.next(res)
        this.whoAmI.roomId = res
        // * Make call now
        this.callNowInRoom()
      }
    )
  }

  ngOnDestroy(): void {
    this.$ngDestroy.next(null)
  }

  sendNotifyConnected(dto: WhoAmI){
    this.mySocket.emit('I-connected', dto)
  }

  callSomeone(receiver: WhoAmI) {
    this.mySocket.emit('Call-someone', this.whoAmI, receiver)
  }

  acceptCallRequest(requester: WhoAmI) {
    this.mySocket.emit('Call-accept', requester, this.whoAmI)
  }

  createAndJoinRoomAndNotifyReceiver(receiver: WhoAmI) {
    this.mySocket.emit('Create-and-join-room-and-notify-receiver', this.whoAmI, receiver)
  }

  callNowInRoom() {
    // console.log(this.whoAmI)
    this.mySocket.emit('call-now', this.whoAmI)
  }

  sendGlobalMess(message: string) {
    this.mySocket.emit('global-mess', this.whoAmI, message)
  }

  sendRoomMess(message: string) {
    this.mySocket.emit('room-mess', this.whoAmI, message)
  }

  getOnlineUsers() {
    return this.mySocket
      .fromEvent('online-users')
      .pipe(map((data: WhoAmI[]) => data))
  }

  getDisconnectedUser() {
    return this.mySocket
    .fromEvent('one-disconnect')
    .pipe(map((data: WhoAmI[]) => data))
  }

  getUserJustOnline() {
    return this.mySocket
    .fromEvent('one-user-online')
    .pipe(map((data: WhoAmI) => data))
  }

  getCallRequest() {
    return this.mySocket
    .fromEvent('request-calling')
    .pipe(map((data: {requester: WhoAmI, receiver: WhoAmI}) => data))
  }
  
  getCallAccepted() {
    return this.mySocket
    .fromEvent('Call-accepted')
    .pipe(map((data: {requester: WhoAmI, receiver: WhoAmI}) => data))
  }

  getNotifyRoomId() {
    return this.mySocket
    .fromEvent('notify-room-id')
    .pipe(map((data: string) => data))
  }

  getCalled() {
    return this.mySocket
    .fromEvent('one-join-call')
    .pipe(map((data: WhoAmI) => data))
  }

  getGlobalMessage() {
    return this.mySocket
    .fromEvent('global-mess')
    .pipe(map((data: {sender: WhoAmI, message: string}) => data))
  }

  getRoomMessage() {
    return this.mySocket
    .fromEvent('room-mess')
    .pipe(map((data: {sender: WhoAmI, message: string}) => data))
  }

  endCall() {
    this.peer.disconnect()
  }
}
