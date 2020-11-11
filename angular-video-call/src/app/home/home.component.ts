import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import Peer from 'peerjs';
import { Observable } from 'rxjs';
import { concatMap, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BaseComponent } from '../components/Base.component';
import { CallRequestComponent } from '../components/call-request/call-request.component';
import { IChatMessage } from '../model/chatMessage.model';
import { WhoAmI } from '../model/SocketIOInfo.model';
import { CallService } from '../services/call.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent implements OnInit,AfterViewInit,OnChanges {

  @ViewChild('myvideo') myvideo: ElementRef
  @ViewChild('friendvideo') friendvideo: ElementRef

  mypeerid
  mysocketid
  roomid
  anotherid = new FormControl('', [Validators.required])
  listOnlineUser: Observable<WhoAmI[]>
  myStream: MediaStream
  friendStream: MediaStream[]

  floatRight = true
  chatValue: string
  chatRoomValue: string

  globalChatMessage: IChatMessage[]
  roomChatMessage: IChatMessage[]

  micStatus = true
  micIcon = 'mic'

  videoStatus = true
  videoIcon = 'videocam'

  constructor(
    private callService: CallService,
    private router: Router,
    private dialog: MatDialog
  ) {
    super()
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('change')
    console.log(changes)
  }
  
  ngAfterViewInit(): void {
    // console.log(this.myvideo)
    // let video = this.myvideo.nativeElement

    this.callService.peer.on('call', (call) => {
      console.log(`on call`)
      navigator.getUserMedia({video: true, audio: true}, (stream) => {
        call.answer(stream)
        call.on('stream', (remoteStream: MediaStream) => {
          console.log('on stream on call')
          if (remoteStream.id !== this.myStream.id && !this.friendStream.includes(remoteStream)){
            this.friendStream.push(remoteStream)
          }
        })
      }, (err) => {
        console.log(`error on call ${err}`)
      })
    })
  }

  ngOnInit(): void {
    this.mypeerid = this.callService.mypeerid.asObservable()
    this.mysocketid = this.callService.mysocketid.asObservable()
    this.listOnlineUser = this.callService.onlineUsers.asObservable()
    this.roomid = this.callService.roomId.asObservable()

    this.friendStream = []
    this.globalChatMessage = []

    this.callService.whoAmI = {
      email: sessionStorage.getItem('email'),
      socketId: '',
      peerId: '',
      roomId: ''
    }

    this.callService.mysocketid
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe(
      res => {
        this.callService.whoAmI.socketId = res
      }
    )

    this.callService.mypeerid
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe(
      res => {
        if (res !== null){
          this.callService.whoAmI.peerId = res
          this.callService.sendNotifyConnected(this.callService.whoAmI)
        }
      }
    )

    this.callService.getCallRequest()
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe(
      res => {
        // console.log(res)
        this.openCallRequestDialog(res.requester)
      }
    )

    this.callService.getCallAccepted()
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe(
      res => {
        // console.log(res)
        this.callService.createAndJoinRoomAndNotifyReceiver(res.receiver)
      }
    )

    this.callService.getCalled()
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe(
      res => {
        console.log('one call', res)
        navigator.getUserMedia({video: true, audio: true}, (stream) => {
          this.myStream = stream
          if (res.peerId !== this.callService.mypeerid.value){
            const call = this.callService.peer.call(res.peerId, this.myStream)
            call.on('stream', (remoteStream: MediaStream) => {
              console.log('on-stream on connect')
              if (remoteStream.id !== this.myStream.id && !this.friendStream.includes(remoteStream)){
                this.friendStream.push(remoteStream)
              }
            })
          }
        }, (err) => {
          // console.log(err)
        })
      }
    )

    this.callService.getGlobalMessage()
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe(
      res => {
        // console.log(res)
        if (res.sender.email !== this.callService.whoAmI.email){
          this.globalChatMessage.push({
            floatRight: false,
            message: res.message,
            sender: res.sender
          })
        }
      }
    )

    this.callService.getRoomMessage()
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe(
      res => {
        if (res.sender.email !== this.callService.whoAmI.email){
          this.roomChatMessage.push({
            floatRight: false,
            message: res.message,
            sender: res.sender
          })
        }
      }
    )
  }

  // ! Don't use
  connect() {
    let video = this.myvideo.nativeElement
    let myVideo = this.friendvideo.nativeElement
    navigator.getUserMedia({video: true, audio: true}, (stream) => {
      myVideo.srcObject = stream
      myVideo.play()
      const call = this.callService.peer.call(this.anotherid.value, stream)
      call.on('stream', (remoteStream : MediaStream) => {
        console.log(`stream on connect() `, remoteStream)
        this.callService.myStream.next(remoteStream)
        video.srcObject = remoteStream
        video.play()
      })
    }, (err) => {
      console.log(`error on stream ${err}`)
    })
    // this.call = this.peer.call(this.anotherid.value, )
  }

  requestCall(user: WhoAmI) {
    // this.openCallRequestDialog(user)
    this.callService.callSomeone(user)
  }

  openCallRequestDialog(user: WhoAmI) {
    const dialogRef = this.dialog.open(CallRequestComponent, {
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: user
    })

    dialogRef.afterClosed().subscribe((result: {result: boolean}) => {
      console.log(result)
      if (result.result) {
        this.callService.acceptCallRequest(user)
      } else {
        // * Do nothing
      }
    })
  }

  logOut(){
    sessionStorage.clear()
    this.router.navigate(['login'])
  }

  sendGlobalMess() {
    this.globalChatMessage.push({
      sender: this.callService.whoAmI,
      message: this.chatValue,
      floatRight: true
    })
    this.callService.sendGlobalMess(this.chatValue)
  }

  sendRoomMess() {
    this.roomChatMessage.push({
      sender: this.callService.whoAmI,
      message: this.chatRoomValue,
      floatRight: true
    })
    this.callService.sendRoomMess(this.chatValue)
  }
  
  toogleMic() {
    if (this.micStatus) {
      this.micStatus = false
      this.micIcon = 'mic_off'
      this.myStream.getAudioTracks()[0].enabled = false
    } else {
      this.micStatus = true
      this.micIcon = 'mic'
      this.myStream.getAudioTracks()[0].enabled = true
    }
  }

  toggleVideo() {
    if (this.videoStatus){
      this.videoStatus = false
      this.videoIcon = 'videocam_off'
      this.myStream.getVideoTracks()[0].enabled = false
    } else {
      this.videoStatus = true
      this.videoIcon = 'videocam'
      this.myStream.getVideoTracks()[0].enabled = true
    }
  }

  endCall() {
    this.myStream = null
    this.friendStream = []
    this.callService.roomId.next(null)
    this.callService.endCall()
  }
}
