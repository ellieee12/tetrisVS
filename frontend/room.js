import {joinRoom, selfId} from 'trystero'

let roomId = 42
export const room = joinRoom(
  {appId: 'http://localhost:5173'},
  roomId
)




export{selfId,roomId}