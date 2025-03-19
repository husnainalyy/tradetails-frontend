'use client'

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Heart, MessageCircle, Share2, Save, SaveIcon, Bookmark } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PostCard({ post, onLike, onComment, onUserClick }) {
    const [comment, setComment] = useState("")

    if (!post || !post.createdBy) {
        return null;
    }

    const formatTimeAgo = (date) => {
        const now = new Date()
        const past = new Date(date)
        const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'just now'
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
        return `${Math.floor(diffInMinutes / 1440)} days ago`
    }

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            onComment(comment);
            setComment("");
        }
    }

    return (
        <Card className="max-w-xl mx-auto bg-black-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={post.createdBy.image} alt={post.createdBy.name} />
                        <AvatarFallback>{post.createdBy.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span
                            className="text-sm font-semibold cursor-pointer hover:underline"
                            onClick={() => onUserClick(post.createdBy._id)}
                        >
                            {post.createdBy.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                        </span>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Report</DropdownMenuItem>
                        <DropdownMenuItem>Copy link</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="pb-2">
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-sm mb-3">{post.description}</p>
                {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-0.5 rounded-md overflow-hidden">
                        {post.images.slice(0, 4).map((image, index) => (
                            <div key={index} className="relative aspect-square">
                                <img
                                    src={image}
                                    alt={`Post image ${index + 1}`}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                {index === 3 && post.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">+{post.images.length - 4}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 pt-0">
                <div className="flex items-center justify-between w-full border-y py-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => onLike(post._id)}>
                        <Heart className="h-4 w-4" />
                        <span className="text-xs">{post.likes?.length || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{post.comments?.length || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4" />
                        <span className="text-xs">{post.shares?.length || 0}</span>
                    </Button>
                </div>
                {post.comments && post.comments.length > 0 && (
                    <div className="w-full">
                        {post.comments.map((comment) => (
                            <div key={comment._id} className="flex items-start space-x-2 mb-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={comment.userId?.image} alt={comment.userId?.name || 'Anonymous'} />
                                    <AvatarFallback>{comment.userId?.name?.[0] || 'A'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-normal items-center gap-2">
                                        <span className="font-bold text-md text-[#ffb703]">{comment.userId?.name || 'Anonymous'}</span>
                                        <p className="text-sm ">
                                            {' '}
                                            {comment.comment}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatTimeAgo(comment.commentAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSubmitComment} className="flex items-center space-x-2 w-full">
                    <Input
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 h-8 text-sm bg-[#1E293B]"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="px-3 h-8"
                        disabled={!comment.trim()}
                    >
                        Post
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
