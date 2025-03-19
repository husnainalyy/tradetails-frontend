"use client"

import * as React from "react"
import { MessageSquare, LayoutGrid, ShoppingBag, Bell, Search, User } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react" // Import Clerk's useAuth hook
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AllAds } from "./Ads"
import SellPage from "./Sells"
import { Profile } from "./Profile"
import Posts from "./Posts"
import RecentChats from "./RecentChats copy"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarRail,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarInput,
    SidebarTrigger,
} from "@/components/ui/sidebar"

// Navigation items
const navigation = [
    { title: "Posts", icon: LayoutGrid, link: "/" },
    { title: "Chats", icon: MessageSquare, link: "/chat" },
    { title: "Ads", icon: Bell, link: "/" },
    { title: "Sell", icon: ShoppingBag, link: "/" },
    { title: "Profile", icon: User, link: "/" },
]

export default function Dashboard() {
    const [activeTab, setActiveTab] = React.useState("Posts")
    const { isSignedIn } = useAuth() // Get the authentication status
    const navigate = useNavigate()
    const location = useLocation()

    React.useEffect(() => {
        if (!isSignedIn) {
            navigate("/") // Redirect to home page if not signed in
        }
    }, [isSignedIn, navigate])

    React.useEffect(() => {
        if (location.pathname === "/") {
            setActiveTab("Posts")
        }
    }, [location])

    const handleNavigation = (item) => {
        if (item.title === "Chats") {
            navigate(item.link)
        } else {
            setActiveTab(item.title)
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case "Posts":
                return <Posts />
            case "Ads":
                return <AllAds />
            case "Sell":
                return <SellPage />
            case "Profile":
                return <Profile />
            default:
                return <Posts />
        }
    }

    return (
        <div className="text-white pt-0">
            <div className="flex">
                {/* Sidebar using shadcn components with #080D27 background */}
                <SidebarProvider>
                    <Sidebar className="border-r border-slate-800 md:z-[50] z-[100] top-20" style={{ backgroundColor: "#080D27" }}>
                        <SidebarHeader className="bg-[#080D27] ">
                            <SidebarGroup className="py-0">
                                <SidebarGroupContent className="relative">
                                    <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
                                    <SidebarInput
                                        type="search"
                                        placeholder="Search..."
                                        className="pl-8 bg-slate-900/50 focus-visible:ring-slate-700"
                                    />
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarHeader>
                        <SidebarContent className="bg-[#080D27]">
                            <ScrollArea className="h-[calc(100vh-4rem)]">
                                <SidebarGroup>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {navigation.map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        isActive={activeTab === item.title}
                                                        onClick={() => handleNavigation(item)}
                                                        className={cn("w-full justify-start", activeTab === item.title && "bg-slate-800")}
                                                    >
                                                        <item.icon className="mr-2 h-4 w-4" />
                                                        <span>{item.title}</span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                                <Separator className="mx-2 my-2" />
                                <SidebarGroup>
                                    <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <RecentChats />
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </ScrollArea>
                        </SidebarContent>
                        <SidebarRail />
                    </Sidebar>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Add SidebarTrigger for mobile */}
                        <div className="flex items-center p-4 border-b border-slate-800 md:hidden">
                            <SidebarTrigger className="text-white" />
                            <h1 className="ml-2 text-lg font-semibold">{activeTab}</h1>
                        </div>
                        <ScrollArea className="h-[calc(100vh-4rem)]">{renderContent()}</ScrollArea>
                    </main>

                    {/* Right Sidebar */}
                    <aside className="w-64 border-l border-slate-800 bg-slate-900/20 hidden md:block">
                        <ScrollArea className="h-[calc(100vh-4rem)]">
                            <div className="flex flex-col gap-4 p-4">
                                <div>
                                    <h3 className="mb-2 px-2 text-sm font-semibold">Ads</h3>
                                    <div className="grid gap-2">
                                        {["./images/ad1.png", "./images/ad2.png", "./images/ad3.png"].map((image, i) => (
                                            <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                                <div className="aspect-video rounded-md bg-slate-800">
                                                    <img src={image || "/placeholder.svg"} alt={`Ad ${i + 1}`} />
                                                </div>
                                                <p className="mt-2 text-xs text-slate-400">Advertisement {i + 1}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </aside>
                </SidebarProvider>
            </div>
        </div>
    )
}

