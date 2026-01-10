import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env?.VITE_REACT_APP_SOCKET_URL ||
  "https://guru-rohan2.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: false,   
});

export default socket;
