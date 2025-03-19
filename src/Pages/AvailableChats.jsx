'use client';

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageCircle, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useFormState } from "react-dom";

const AvailableChats = ({ onChatSelect, userId: ClerkUserId }) => {
  const [chats, setChats] = useState([]);
  const [expandedChats, setExpandedChats] = useState(new Set());
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
        const response = await axios.get(`https://tradetails-backend-production.up.railway.app/api/chats/user/${ClerkUserId}`);
        const UserResponse = await axios.get(`https://tradetails-backend-production.up.railway.app/api/users/clerk/${ClerkUserId}`)
        setDataBaseUserId(UserResponse.data.userId);
        setChats(response.data || []); // Ensure we always set an array

        console.log("what is my response ",response.data)
      } catch (error) {
        console.error("Error fetching chats:", error);
        setError("Failed to load chats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [ClerkUserId]);

  const toggleChatExpansion = (chatId) => {
    setExpandedChats((prevExpandedChats) => {
      const newExpandedChats = new Set(prevExpandedChats);
      if (newExpandedChats.has(chatId)) {
        newExpandedChats.delete(chatId);
      } else {
        newExpandedChats.add(chatId);
      }
      return newExpandedChats;
    });
  };

  if (loading) {
    return <div className="text-center p-4">Loading chats...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full p-0">
      <h2 className="text-2xl font-bold m-4">Available Chats</h2>
      {chats.length === 0 ? (
        <div className="text-center text-zinc-500">No chats available</div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            className="border border-zinc-700 rounded-none overflow-hidden"
          >
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center p-5  hover:bg-zinc-800 m-0"
              onClick={() => toggleChatExpansion(chat._id)}
            >
              <span className="font-semibold text-md">
              {chat.adId ? `Ad: ${chat.adId._id}` : 'No Ad Info'}
              </span>
              {expandedChats.has(chat._id) ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </Button>
            {expandedChats.has(chat._id) && (
                    <div className="p-4 bg-[#080D27]">
                <div
                  className="flex items-center justify-between py-2 cursor-pointer px-4 rounded-lg hover:bg-blue-700"
                  onClick={() => onChatSelect(chat._id)}
                >
                  <div className="flex items-center">
                    <MessageCircle size={20} className="mr-2 text-zinc-400" />
                    <div>
                      <h3 className="font-medium">
                Chat with {chat.participants.find(p => p.userId._id !== dataBaseUserId)?.userId.name || 'Unknown'}

                        {console.log(chat)}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {chat.messages && chat.messages.length > 0
                          ? chat.messages[chat.messages.length - 1].message
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AvailableChats;