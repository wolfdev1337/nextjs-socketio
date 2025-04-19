import { Server, ServerOptions } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

type SocketResponse = NextApiResponse & {
  socket: { server: ServerOptions & { io: Server } };
};

const SocketHandler = async (req: NextApiRequest, res: SocketResponse) => {
  if (!res.socket.server.io) {
    // Create a new Socket.IO server
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    // Store the Socket.IO server instance
    res.socket.server.io = io;

    // Socket.IO event handlers
    io.on("connection", (socket) => {
      socket.on("message", (message) => {
        // Broadcast the message to all connected clients
        io.emit("message", message);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  res.end();
};

export default SocketHandler;
