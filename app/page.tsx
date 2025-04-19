"use client";

import { useState, useEffect, useRef } from "react";
import type React from "react";
import { io, type Socket } from "socket.io-client";
import {
  Box,
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  AppBar,
  Toolbar,
  Avatar,
} from "@mui/material";

// Message type definition
interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    // Random username generation
    const randomUser = `User_${Math.floor(Math.random() * 1000)}`;
    setUsername(randomUser);

    // First, initialize the Socket.IO server by making a request to the API route
    fetch("/api/socket")
      .then(() => {
        // Connect to Socket.IO server
        const socketInstance = io({
          path: "/api/socket",
          addTrailingSlash: false,
        });

        socketInstance.on("connect", () => {
          setIsConnected(true);
          console.log("Connected to Socket.IO server");
        });

        socketInstance.on("disconnect", () => {
          setIsConnected(false);
          console.log("Disconnected from Socket.IO server");
        });

        socketInstance.on("message", (message: Message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        setSocket(socketInstance);

        // Cleanup on component unmount
        return () => {
          socketInstance.disconnect();
        };
      })
      .catch((err) => {
        console.error("Failed to initialize Socket.IO server:", err);
      });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (socket) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageInput,
        user: username,
        timestamp: new Date(),
      };

      socket.emit("message", newMessage);
      setMessageInput("");
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Container
      maxWidth="md"
      sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <AppBar position="static" color="primary" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Next.js Chat App
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">
              {isConnected ? "Connected" : "Disconnected"}
            </Typography>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: isConnected ? "success.main" : "error.main",
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          mb: 2,
          overflow: "auto",
          p: 2,
          bgcolor: "background.default",
        }}
      >
        <List>
          {messages.map((msg) => (
            <ListItem
              key={msg.id}
              alignItems="flex-start"
              sx={{
                flexDirection: msg.user === username ? "row-reverse" : "row",
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor:
                    msg.user === username ? "primary.main" : "secondary.main",
                  mr: msg.user === username ? 0 : 2,
                  ml: msg.user === username ? 2 : 0,
                }}
              >
                {getInitials(msg.user)}
              </Avatar>
              <Box>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    bgcolor:
                      msg.user === username
                        ? "primary.light"
                        : "background.paper",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: msg.user === username ? "right" : "left",
                    mt: 0.5,
                  }}
                >
                  {msg.user} • {formatTime(msg.timestamp)}
                </Typography>
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Paper component="form" onSubmit={sendMessage} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isConnected || !messageInput.trim()}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
