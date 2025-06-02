import { Server } from "socket.io"

let io: Server;

export function initSocket(server: Server) {
    io = server;
}

export function broadcastNewProduct(product: any) {
    if (!io) return;
    io.emit("new-product", product);
}
