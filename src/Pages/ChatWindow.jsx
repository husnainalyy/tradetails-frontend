'use client'

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, ArrowLeft, MoreVertical, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const MessageBubble = ({ message, userId, chatPartner, clerkUser }) => {
    const isSender = message.senderId === userId;

    return (
        <div
            key={message.messageId}
            className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
        >
            {!isSender && (
                <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
                    <AvatarImage src={chatPartner?.userId.image} />
                    <AvatarFallback>{chatPartner?.userId.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                <div
                    className={`p-3 rounded-2xl w-auto max-w-80 ${isSender ? "bg-blue-500 text-white" : "bg-zinc-700 text-white"
                        }`}
                >
                    <p className="text-sm whitespace-normal break-words">{message.message}</p>
                </div>
                <div className="flex items-center mt-1">
                    <span className="text-xs text-zinc-400">
                        {new Date(message.sentAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                    {isSender && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-3 h-3 ml-1 text-green-500"
                        >
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>

            {isSender && (
                <Avatar className="w-8 h-8 ml-2 flex-shrink-0">
                    <AvatarImage src={clerkUser.imageUrl} />
                    <AvatarFallback>{clerkUser.firstName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
};

const ChatWindow = ({ chatId, clerkUser, socket, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [typing, setTyping] = useState(false);
    const [chatPartner, setChatPartner] = useState(null);
    const [adName, setAdName] = useState("");
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.get(`https://tradetails-backend-production.up.railway.app/api/users/clerk/${clerkUser.id}`);
                setUserId(response.data.userId);
            } catch (error) {
                console.error("Error fetching userId:", error);
                setError("Failed to load user data. Please try again.");
            }
        };

        fetchUserId();
    }, [clerkUser.id]);

    useEffect(() => {
        if (!userId) return;

        const fetchChatData = async () => {
            if (!chatId) {
                console.error("Chat ID is undefined");
                return;
            }

            try {
                const response = await axios.get(`https://tradetails-backend-production.up.railway.app/api/chats/${chatId}`);
                const chatData = response.data;
                if (chatData) {
                    setMessages(chatData.messages || []);
                    const partnerData = chatData.participants.find(p => p.userId._id !== userId);
                    setChatPartner(partnerData);

                    if (chatData.adId && typeof chatData.adId === 'string') {
                        try {
                            const adResponse = await axios.get(`https://tradetails-backend-production.up.railway.app/api/ads/${chatData.adId}`);
                            setAdName(adResponse.data.title);
                        } catch (adError) {
                            console.error("Error fetching ad data:", adError);
                            setAdName("Ad information unavailable");
                        }
                    } else {
                        setAdName("Ad information unavailable");
                    }
                } else {
                    setError("No chat data found.");
                }
            } catch (error) {
                console.error("Error fetching chat data:", error);
                setError("Failed to load chat data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();

        if (socket) {
            socket.on("message", (message) => {
                setMessages((prevMessages) => [...prevMessages, { ...message, status: 'received' }]);
            });

            socket.on("typing", (data) => {
                if (data.userId !== userId) {
                    setTyping(true);
                    setTimeout(() => setTyping(false), 2000);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off("message");
                socket.off("typing");
            }
        };
    }, [chatId, userId, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        console.log("handle send message has been called");
        if (newMessage.trim() && userId) {
            const tempMessage = {
                messageId: Date.now().toString(),
                senderId: userId,
                message: newMessage,
                sentAt: new Date().toISOString(),
            };

            setNewMessage("");

            try {
                const response = await axios.post(
                    `https://tradetails-backend-production.up.railway.app/api/chats/${chatId}/messages`,
                    {
                        clerkUserId: clerkUser.id,
                        message: newMessage,
                        messageType: "text",
                    }
                );


                if (socket) {
                    socket.emit("message", {
                        senderId: userId,
                        message: newMessage,
                        sentAt: new Date().toISOString(),
                    });
                }
            } catch (error) {
                console.error("Error sending message:", error);
                setError("Failed to send message. Please try again.");
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg.messageId !== tempMessage.messageId)
                );
            }
        }
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit("typing", { chatId, userId: clerkUser.id });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    const handleDeleteChat = async () => {
        try {
            const response = await axios.delete(`https://tradetails-backend-production.up.railway.app/api/chats/${chatId}`);
            window.location.reload();
        }
        catch (error) {
            console.log(error, 'error occurred in handle delete chat')

        }
    }
    const handleViewProfile = async () => {
        try {

        }
        catch (error) {
            console.log(error, 'error occurred in handle View Profile');
        }
    }
    return (
        <div className="flex flex-col h-full ">
            {/* Chat Header */}
            <div className="bg-black-100 p-4 flex items-center justify-between border-b border-zinc-700">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <Avatar className="w-10 h-10 mr-3">
                        <AvatarImage src={chatPartner?.userId.image} />
                        <AvatarFallback>{chatPartner?.userId.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{chatPartner?.userId.name || 'Chat Partner'}</h2>
                        <p className="text-sm text-zinc-400">{adName}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="bg-neutral-950 ">
                        <DropdownMenuItem className="hover:bg-white" onClick={handleViewProfile}>View Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 hover:bg-white" onClick={handleDeleteChat}>Delete Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                    <MessageBubble message={message} userId={userId} chatPartner={chatPartner} clerkUser={clerkUser} />
                ))}
                {typing && (
                    <div className="text-zinc-500 italic">Someone is typing...</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-700">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex items-center"
                >
                    <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleTyping}
                        placeholder="Type your message..."
                        className="flex-1 mr-2 bg-zinc-800 text-white border-zinc-700"
                    />
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                        <Send size={20} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;

