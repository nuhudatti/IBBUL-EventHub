"use client";

import { io, type Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001");
  }
  return socketInstance;
}
