import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SavedPosts({ onPostClick }) {
    const [savedPosts, setSavedPosts] = useState([])
    const { user } = useUser()
    const { toast } = useToast()

    const fetchSavedPosts = useCallback(async () => {
        if (!user) return;

        try {
            const response = await fetch('https://tradetails-backend-production.up.railway.app/api/users/post', {
                method: 'GET',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved posts');
            }

            const data = await response.json();
            setSavedPosts(data);
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            toast({
                title: "Error",
                description: "Failed to fetch saved posts. Please try again.",
                variant: "destructive",
            });
        }
    }, [user, toast]);

    useEffect(() => {
        if (user) {
            fetchSavedPosts();
        }
    }, [user, fetchSavedPosts]);

    if (savedPosts.length === 0) {
        return <div>No saved posts found.</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedPosts.map((post) => (
                <Card key={post._id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onPostClick(post)}>
                    <CardHeader>
                        <CardTitle className="truncate">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video relative mb-4">
                            <img
                                src={post.images[0]}
                                alt={post.title}
                                className="object-cover absolute inset-0 w-full h-full rounded-md"
                            />
                        </div>
                        <p className="text-sm text-gray-500 truncate">{post.description}</p>
                        <div className="flex items-center mt-4">
                            <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={post.createdBy.image} alt={post.createdBy.name} />
                                <AvatarFallback>{post.createdBy.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{post.createdBy.name}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
