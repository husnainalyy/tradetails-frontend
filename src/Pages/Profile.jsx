import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import {  MapPin, Mail, MessageSquare, Package, MoreVertical, Trash } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

const data = {
    buyerTips: [
        "Always inspect the item in person before purchasing.",
        "Meet the seller in a safe, public place.",
        "Compare prices with similar ads before making a decision.",
        "Ask for original receipts or documents when buying electronics.",
        "Test electronics on the spot to ensure they work.",
        "Avoid sharing sensitive information like bank details.",
        "If a deal sounds too good to be true, it probably is.",
        "Check the condition of the item thoroughly before paying.",
        "Negotiate politely but firmly to get a fair deal.",
        "Be cautious of sellers requesting advance payments."
    ],
    greetings: [
        "Welcome back, superstar! 🌟",
        "Good to see you again! Let's make today awesome.",
        "Hello! Ready for new opportunities?",
        "Hey there! Let's find something amazing today. 🚀",
        "Welcome! Great things are waiting for you.",
        "Hello, champ! Let's make it a productive day. 💼",
        "Hi there! Have you checked out the latest ads? 👀",
        "Good vibes only! Let's get started. ✨",
        "Welcome to your profile! What's your next adventure? 🌍",
        "Hey! We've got something exciting for you. 🎉"
    ]
};

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

export function Profile() {
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const fetchUserInfo = async () => {
        if (!user || !user.id) {
            setError('User not signed in');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/users/profileUser/${user.id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setUserInfo(data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, [user]);

    const handleDeletePost = async (postId) => {
        try {
            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            toast({
                title: "Success",
                description: "Post deleted successfully",
            });

            // Refresh user info to update the UI
            fetchUserInfo();
        } catch  {
            toast({
                title: "Error",
                description: "Failed to delete post",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAd = async (adId) => {
        try {
            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/ads/${adId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete ad');
            }

            toast({
                title: "Success",
                description: "Ad deleted successfully",
            });

            // Refresh user info to update the UI
            fetchUserInfo();
        } catch  {
            toast({
                title: "Error",
                description: "Failed to delete ad",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-destructive">
                Error: {error}
            </div>
        );
    }

    if (!userInfo) return null;

    const { user: profileData, posts, ads } = userInfo;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Card className="border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader>
                    <div className="text-xl font-semibold text-[#329680] mb-6">
                        {getRandomItem(data.greetings)}
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 md:items-center">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={profileData.image} alt={profileData.name} />
                            <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                                {profileData.isVerified && (
                                    <Badge variant="secondary">Verified</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">@{profileData.username}</p>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {profileData.email}
                            </div>
                            {profileData.bio && (
                                <p className="text-sm max-w-md">{profileData.bio}</p>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <Separator className="my-6" />

                <div className="flex justify-center items-center">
                    <div className="flex flex-col justify-center items-center">
                        <h3 className="text-2xl text-[#ecb617] font-bold">💡 Tip of the Day</h3>
                        <p className="text-lg">{getRandomItem(data.buyerTips)}</p>
                    </div>
                </div>

                <Separator className="my-6" />

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="posts" className="flex gap-2 text-xl">
                            <MessageSquare className="h-5 w-5" />
                            Posts ({posts.length})
                        </TabsTrigger>
                        <TabsTrigger value="ads" className="flex gap-2 text-xl">
                            <Package className="h-5 w-5" />
                            Ads ({ads.length})
                        </TabsTrigger>
                    </TabsList>

                    <Separator className="my-6" />

                    <TabsContent value="posts" className="mt-6">
                        {posts.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No posts yet
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {posts.map((post) => (
                                    <Card key={post._id} className="flex flex-col justify-between overflow-hidden h-full">
                                        <div className="relative">
                                            {post.images && post.images.length > 0 && (
                                                <img
                                                    src={post.images[0]}
                                                    alt=""
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/40">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-black/80">
                                                        <DropdownMenuItem
                                                            className="text-destructive "
                                                            onClick={() => handleDeletePost(post._id)}
                                                        >
                                                            <Trash className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 flex flex-col flex-grow">
                                            <div className="flex-grow">
                                                <h3 className="font-semibold">{post.title}</h3>
                                                <p className="text-sm text-muted-foreground">{post.description}</p>
                                            </div>
                                            <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                                                <span>{post.likes?.length || 0} likes</span>
                                                <span>{post.comments?.length || 0} comments</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="ads" className="mt-6">
                        {ads.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No ads yet
                            </div>
                        ) : (
                                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                                    {ads.map((ad) => (
                                        <Card key={ad._id} className="flex flex-col justify-between overflow-hidden h-full">
                                            {ad.images && ad.images.length > 0 && (
                                                <img
                                                    src={ad.images[0]}
                                                    alt={ad.brand}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <CardContent className="p-4 flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold">{ad.brand}</h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
                                                    </div>
                                                    <Badge variant={ad.condition === 'new' ? 'default' : 'secondary'}>
                                                        {ad.condition}
                                                    </Badge>
                                                </div>
                                                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    {ad.location}
                                                </div>
                                                <div className="mt-2 font-semibold">
                                                    ${ad.price.toLocaleString()}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-4">
                                                <Button
                                                    variant="destructive"
                                                    className="w-full bg-red-600"
                                                    onClick={() => handleDeleteAd(ad._id)}
                                                >
                                                    <Trash className="h-4 w-4 mr-2" />
                                                    Delete Ad
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}

