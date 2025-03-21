import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useChatSocket = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState("");

    const isTypingRef = useRef(false);

    useEffect(() => {
        const newSocket = io("http://localhost:5001");

        setSocket(newSocket);

        newSocket.on("connect", () => setConnectionStatus("connected"));
        newSocket.on("disconnect", () => setConnectionStatus("disconnected"));
        newSocket.on("connect_error", () => setConnectionStatus("connect_error"));

        newSocket.on("connection_established", ({ userId, username }) => {
            setUserId(userId);
            setUsername(username);
        });

        newSocket.on("message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        newSocket.on("online_users", setOnlineUsers);

        newSocket.on("user_typing", ({ userId, username, isTyping }) => {
            setTypingUsers((prev) => {
                const exists = prev.some((user) => user.userId === userId);

                if (isTyping && !exists) {
                    return [...prev, { userId, username }];
                }

                if (!isTyping) {
                    return prev.filter((user) => user.userId !== userId);
                }

                return prev;
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = (text) => {
        if (socket && text.trim()) {
            socket.emit("send_message", { text });
        }
    };

    const emitTyping = (isTyping) => {
        if (socket && isTypingRef.current !== isTyping) {
            socket.emit("typing", { isTyping });

            isTypingRef.current = isTyping;
        }
    };

    const changeUsername = (newUsername) => {
        if (socket && newUsername.trim()) {
            socket.emit("change_username", { username: newUsername });

            setUsername(newUsername);
        }
    };

    return {
        socket,
        messages,
        onlineUsers,
        typingUsers,
        connectionStatus,
        username,
        userId,
        sendMessage,
        emitTyping,
        changeUsername,
    };
};

export default useChatSocket;