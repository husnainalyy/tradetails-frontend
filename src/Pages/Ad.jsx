'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Star, MessageCircle, Info, Package, Battery, Camera, Smartphone, Monitor, Share2, Heart, Clock, Shield, Tag, Phone, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import axios from "axios"
import PropTypes from 'prop-types'
import { useUser } from "@clerk/clerk-react"
import { Navigate, useNavigate } from 'react-router-dom'

const API_URL = 'https://tradetails-backend-production.up.railway.app'

const fetchSketchfabModel = async (query) => {
    const API_URL = "https://api.sketchfab.com/v3/search"
    const API_KEY = "6787bc73c2974d8ab7f6acc472d150da"
    try {
        const response = await axios.get(API_URL, {
            params: {
                type: "models",
                q: query,
                downloadable: true,
            },
            headers: {
                Authorization: `Token ${API_KEY}`,
            },
        })

        if (response.data.results.length > 0) {
            const model = response.data.results[0]
            return {
                id: model.uid,
                name: model.name,
                thumbnail: model.thumbnails.images[0].url,
                embedUrl: `https://sketchfab.com/models/${model.uid}/embed`,
            }
        } else {
            return null
        }
    } catch (error) {
        console.error("Error fetching model:", error)
        return null
    }
}

SingleAd.propTypes = {
    adId: PropTypes.string.isRequired,
}

export function SingleAd({ adId }) {
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scamDetectionResult, setScamDetectionResult] = useState(null)
    const [sketchfabModel, setSketchfabModel] = useState(null)
    const [activeImage, setActiveImage] = useState(0)
    const [isLiked, setIsLiked] = useState(false)
    const { user } = useUser()
    const navigate = useNavigate();

    const createnewchat = async () => {
        try {
            console.log("create new chat method entered;");

            // Step 1: Get Ad details
            const adResponse = await fetch(`https://tradetails-backend-production.up.railway.app/api/ads/${adId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!adResponse.ok) {
                throw new Error(`Error fetching ad details: ${adResponse.statusText}`);
            }

            const adData = await adResponse.json();
            console.log(adData, 'This is my ad data');

            // Extract user ID from the ad
            const userData = adData.data.createdBy;
            if (!userData) {
                throw new Error('User ID (createdBy) is missing in the ad data');
            }

            console.log(userData, "This is my user ID from the ad");
            const userId = userData._id;
            console.log(userId)
            // Step 2: Get Clerk user ID and other details of the user from the ad
            const userResponse = await axios.get(`https://tradetails-backend-production.up.railway.app/api/users/clerkid/${userId}`);
            const clerkUserId = userResponse.data.clerkUserId;
            console.log(clerkUserId, 'This is my clerk user ID and user details');


            const sellerClerkUserId = userResponse.data.clerkUserId;
            const sellerName = 'none';
            const sellerImage = 'default-avatar.jpg';

            // Step 3: Get the current logged-in user's details
            const buyerClerkUserId = user.id;
            const buyerName = user.name;
            const buyerImage = user.image || 'default-avatar.jpg';

            console.log("seller id", sellerClerkUserId)
            console.log("buyer id", buyerClerkUserId)
            // Step 4: Create the chat

            const chatPayload = {
                adId,
                participants: [
                    {
                        clerkUserId: sellerClerkUserId,
                        role: "buyer",
                        name: buyerName,
                        image: buyerImage,
                    },
                    {
                        clerkUserId: buyerClerkUserId,
                        role: "seller",
                        name: sellerName,
                        image: sellerImage,
                    }
                ]
            };

            const chatResponse = await axios.post('https://tradetails-backend-production.up.railway.app/api/chats', chatPayload);
            console.log(chatResponse.data, 'Chat created successfully');
            navigate('/chat');
        } catch (error) {
            console.error(error, 'Error creating chat');
        }
    };

    
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`${API_URL}/api/ads/${adId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Clerk ${user.id}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) throw new Error("Failed to fetch product")

                const data = await response.json()
                setProduct(data.data)
                if (data.data.description) {
                    checkScamDetection(data.data.description)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error fetching product")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [adId, user])

    useEffect(() => {
        const fetchModel = async () => {
            if (product?.brand) {
                const fetchedModel = await fetchSketchfabModel(product.brand)
                setSketchfabModel(fetchedModel)
            }
        }
        fetchModel()
    }, [product?.brand])

    const checkScamDetection = async (description) => {
        try {
            const response = await fetch(`${API_URL}/api/ads/scam-detection`, {
                method: 'POST',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            })

            if (!response.ok) {
                throw new Error('Failed to check scam detection')
            }

            const data = await response.json()
            setScamDetectionResult(data.result)
        } catch (error) {
            console.error('Error checking scam detection:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center ">
                <div className="relative">
                    <div className="h-32 w-32 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-primary text-sm">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex min-h-screen items-center justify-center ">
                <Card className="p-6 backdrop-blur-lg bg-white/10">
                    <p className="text-lg font-semibold text-white">Error: {error || 'Product not found'}</p>
                </Card>
            </div>
        )
    }

    const specifications = JSON.parse(product.specifications || '{}')

    return (
        <div className="min-h-screen w-full  text-white pb-20">



            <div className="container mx-auto px-4 py-8">

                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {product.brand}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{product.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Posted {new Date(product.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary mb-2">
                                Rs. {product.price.toLocaleString()}
                            </div>
                            {scamDetectionResult && (
                                <HoverCard>
                                    <HoverCardTrigger>
                                        <Badge variant={scamDetectionResult === 'Ad Seems Genuine.' ? 'success' : 'destructive'} className="cursor-help">
                                            <Shield className="h-4 w-4 mr-1" />
                                            {scamDetectionResult}
                                        </Badge>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80 bg-black-100">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold">Scam Detection Result</h4>
                                            <p className="text-sm">
                                                Our AI-powered system has analyzed this listing and determined it appears to be {scamDetectionResult}.
                                                However, always exercise caution when making online purchases.
                                            </p>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            )}
                        </div>
                    </div>
                </div>



                <div className="space-y-8 ">
                    {/* Image Gallery */}
                    <Card className="overflow-hidden border-0 shadow-2xl bg-black-100">
                        <CardContent className="p-0">
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {product.images?.map((image, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video relative overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={`${product.brand} - Image ${index + 1}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </Carousel>
                            <div className="flex gap-2 p-4 overflow-x-auto">
                                {product.images?.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${activeImage === index ? 'ring-2 ring-primary scale-95' : 'opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-black-100 border-0 shadow-2xl">
                        <CardContent className="p-6">
                            <div className=" ">

                                <div className="flex justify-between text-lg font-bold text-gray-400">
                                    Condition
                                    <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors px-4 py-1.5 text-sm font-medium rounded-full">
                                        {product.condition}
                                    </Badge>

                                </div>


                            </div>
                        </CardContent>
                    </Card>


                    {sketchfabModel && (
                        <Card className="overflow-hidden border-0 shadow-2xl bg-black-100">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    3D Model Preview
                                </h3>
                                <div className="aspect-video rounded-lg overflow-hidden">
                                    <iframe
                                        title="Sketchfab Model"
                                        frameBorder="0"
                                        allowFullScreen
                                        mozallowfullscreen="true"
                                        webkitallowfullscreen="true"
                                        allow="autoplay; fullscreen; xr-spatial-tracking"
                                        xr-spatial-tracking
                                        execution-while-out-of-viewport
                                        execution-while-not-rendered
                                        web-share
                                        src={sketchfabModel.embedUrl}
                                        className="w-full h-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}



                    <div className="space-y-6">

                        <Card className="border-0 shadow-2xl overflow-hidden bg-black-100">
                            <CardContent className="p-6">
                                <Tabs defaultValue="description" className="w-full">
                                    <TabsList className="w-full">
                                        <TabsTrigger value="description" className="w-1/2 text-lg font-bold">Description</TabsTrigger>
                                        <TabsTrigger value="specifications" className="w-1/2">Specifications</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="description" className="mt-4">
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-gray-300 leading-relaxed">{product.description}</p>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="specifications" className="mt-4">
                                        <Accordion type="single" collapsible className="w-full">
                                            {Object.entries(specifications).map(([category, specs]) => (
                                                <AccordionItem value={category} key={category}>
                                                    <AccordionTrigger className="text-lg">
                                                        <div className="flex items-center gap-2">
                                                            {category === 'Display' && <Monitor className="h-5 w-5" />}
                                                            {category === 'Battery' && <Battery className="h-5 w-5" />}
                                                            {category === 'Camera' && <Camera className="h-5 w-5" />}
                                                            {category === 'Platform' && <Smartphone className="h-5 w-5" />}
                                                            {category === 'Body' && <Package className="h-5 w-5" />}
                                                            {category}
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-2">
                                                            {Object.entries(specs).map(([key, value]) => (
                                                                <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-800">
                                                                    <span className="text-gray-400">{key}</span>
                                                                    <span className="text-gray-200">{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>


                        <Card className="bg-black-100 border-0 shadow-2xl">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold text-gray-100 mb-6">Seller Information</h2>
                                <div className="flex items-start gap-6 mb-8">
                                    <div className="relative">
                                        <Avatar className="h-16 w-16 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-gray-900 transition-all duration-300 hover:scale-105">
                                            <AvatarImage src={product.createdBy.image} alt={product.createdBy.fullName} />
                                            <AvatarFallback className="bg-blue-500/10 text-blue-400">
                                                {product.createdBy.fullName?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-gray-900" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-medium text-gray-100">{product.createdBy.name}</div>
                                        <div className="text-sm text-gray-400">{product.createdBy.email}</div>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>Member since {new Date(product.createdAt).getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]"
                                    onClick={createnewchat}
                                >
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Message Seller
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>



        </div>
    )
}

