'use client'

import React, { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { useUser } from "@clerk/clerk-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X } from 'lucide-react'
import AvailableChats from "./AvailableChats"
import ChatWindow from "./ChatWindow"

const Chat = () => {
    const { user } = useUser()
    const [selectedChat, setSelectedChat] = useState()
    const [socket, setSocket] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const socketInstance = io("https://tradetails-backend-production.up.railway.app")
        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    // Handle location state if using react-router
    useEffect(() => {
        const locationState = window.history.state?.state
        if (locationState && locationState.chatId) {
            setSelectedChat(locationState.chatId)
        }
    }, [])

    const handleChatSelect = (chatId) => {
        setSelectedChat(chatId)
        if (socket) {
            socket.emit("joinRoom", chatId)
        }
        // Close sidebar after selecting a chat on mobile
        setSidebarOpen(false)
    }

    return (
        <div className="flex h-screen" style={{ backgroundColor: "#080D27" }}>
            {/* Mobile menu button - only visible on small screens */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden text-white"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Desktop sidebar - hidden on mobile */}
            <div className="hidden md:block md:w-1/3 border-r border-zinc-700 overflow-hidden" style={{ backgroundColor: "#080D27" }}>
                <AvailableChats onChatSelect={handleChatSelect} userId={user?.id} />
            </div>

            {/* Mobile sidebar using Sheet - only for small screens */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-[300px] border-r border-zinc-700 md:hidden" style={{ backgroundColor: "#080D27" }}>
                    <div className="flex justify-end p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                            className="text-white "
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <AvailableChats onChatSelect={handleChatSelect} userId={user?.id} />
                </SheetContent>
            </Sheet>

            {/* Main chat area - full width on mobile, 2/3 on desktop */}
            <div className="w-full md:w-2/3 text-white">
                {selectedChat ? (
                    <ChatWindow
                        chatId={selectedChat}
                        clerkUser={user}
                        socket={socket}
                        onBack={() => setSelectedChat(null)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full p-4">
                        <p className="text-xl text-zinc-400 text-center">
                            <span className="md:hidden">Tap the menu icon to select a chat</span>
                            <span className="hidden md:inline">Select a chat to start messaging</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Chat
