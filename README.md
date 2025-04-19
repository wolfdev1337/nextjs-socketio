# Next.js SocketIO Chat

A real-time chat application built with Next.js, SocketIO, and Material UI.

## Technologies Used

- **Next.js**: React framework for building the application
- **SocketIO**: For real-time, bidirectional communication
- **Material UI**: Component library for the user interface

## Prerequisites

- Node.js 18.x or later

## Installation

1. Clone the repository:

```bash
git clone https://github.com/wolfdev1337/nextjs-socketio.git
cd nextjs-socketio
npm run dev
```


## How It Works

The application uses a Next.js Pages API route to create and manage a Socket.IO server:

1. The SocketIO server is initialized in `pages/api/socket.ts`
2. The server is attached to the Next.js HTTP server
3. Client components connect to this SocketIO server
4. Messages are broadcast to all connected clients in real-time


-  SocketIO server:
```typescript
if (!res.socket.server.io) {
  const io = new ServerIO(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });
  res.socket.server.io = io;
}
```

-  SocketIO client:
```typescript
fetch("/api/socket").then(() => {
  const socketInstance = io({
    path: "/api/socket",
    addTrailingSlash: false,
  });
  // ...
});
```