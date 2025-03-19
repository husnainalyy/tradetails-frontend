import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";



const RecentChats = () => {
    const navigate = useNavigate()
    const { user } = useUser(); // Destructure the user from useUser hook
    const ClerkUserId = user?.id; // Access the Clerk User ID
    const [chats, setChats] = useState([]);
    const [dataBaseUserId, setDataBaseUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChats = async () => {
            if (!ClerkUserId) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `https://tradetails-backend-production.up.railway.app/api/chats/user/${ClerkUserId}`
                );
                const UserResponse = await axios.get(
                    `https://tradetails-backend-production.up.railway.app/api/users/clerk/${ClerkUserId}`
                );

                setDataBaseUserId(UserResponse.data.userId); // Set the database user
                const fetchedChats = response.data || [];

                // Sort chats by creation date
                const sortedChats = fetchedChats.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setChats(sortedChats);
            } catch (error) {
                console.error("Error fetching chats:", error);
                setError("Failed to load chats. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [ClerkUserId]); // Depend on ClerkUserId

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    const handleRouting = (chatId) => {
        navigate("/chat", { state: { chatId } });
    }
    return (
        <div>
            <h3 className="mb-2 px-2 text-sm font-semibold">Recent Chats</h3>
            <div className="grid gap-2">
                {chats.map((chat, index) => {
                    const otherParticipant = chat.participants.find(
                        (p) => p.userId._id !== dataBaseUserId
                    );

                    return (
                        <Button
                            onClick={() => handleRouting(chat._id)}
                            key={chat._id}
                            variant="ghost"
                            className="w-full justify-start"
                        >
                            <Avatar className="mr-2 h-6 w-6">
                                <AvatarImage
                                    src={otherParticipant?.userId.image || "/placeholder.svg"}
                                    alt={otherParticipant?.userId.name || "User Avatar"}
                                />
                                <AvatarFallback>
                                    {otherParticipant?.userId.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{otherParticipant?.userId.name}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentChats;