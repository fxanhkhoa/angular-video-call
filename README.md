# angular-video-call

- using peerjs
- socket io
- angular 10 
- nodejs

## How to enable video for localhost:
1. type url chrome://flags/#unsafely-treat-insecure-origin-as-secure
2. Enter url in the textarea
3. Choose Enabled in the select option Click image link bellow to see detail

![alt text](https://github.com/fxanhkhoa/angular-video-call/blob/main/enable-camera.png?raw=true)

## Fix Error "Export Peerjs"
```
- Go to file node_modules/peerjs/index.d.ts
- Edit export = Peer; ==> export default Peer;
```
