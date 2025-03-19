import React, { useState, useEffect } from 'react'
import { Grid, Heart, List, MapPin, Star, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@clerk/clerk-react";

import PropTypes from 'prop-types';
import { SingleAd } from './Ad'
import { Card, CardContent, CardHeader } from '@/Components/ui/card'

const API_URL = 'https://tradetails-backend-production.up.railway.app'

function ProductGrid({ view, products, onAdClick }) {
    return (
        <div
            className={`gap-8 ${view === "grid"
                ? "grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2"
                : "space-y-8"
                }`}
        >
            {Array.isArray(products) && products.map((product) => (
                view === "grid" ? (
                    <Card key={product._id} className="overflow-hidden shadow-lg" onClick={() => onAdClick(product._id)}>
                        <CardHeader className="p-0">
                            <div className="relative">
                                <img
                                    src={product.images[0]}
                                    alt={product.model}
                                    className="aspect-[5/3] w-full object-cover rounded-lg rounded-b-none"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 gap-2 flex flex-col">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold">{product.brand}</h3>
                                    <p className="text-md font-semibold">
                                        Rs. {product.price ? product.price.toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex items-center text-md">
                                    <Star className="mr-2 h-5 w-5 fill-primary text-primary" />
                                    {product.condition}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {product.location}
                            </div>
                            <time className="text-sm text-muted-foreground">{new Date(product.createdAt).toLocaleDateString()}</time>
                        </CardContent>
                    </Card>
                ) : (
                    <div key={product._id} className="flex items-start space-x-6 border-b border-gray-300 pb-8" onClick={() => onAdClick(product._id)}>
                        <div className="relative w-1/3 max-w-[240px]">
                            <img
                                src={product.images[0] || "/placeholder.jpg"}
                                alt={product.model}
                                className="aspect-[4/3] w-full rounded-lg object-cover"
                            />
                           
                        </div>
                        <div className="flex-1 space-y-3 pl-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold">{product.brand}</h3>
                                    <p className="text-xl font-semibold">
                                        Rs. {product.price ? product.price.toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex items-center text-lg">
                                    <Star className="mr-2 h-5 w-5 fill-primary text-primary" />
                                    {product.condition}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {product.location}
                            </div>
                            <p className="text-md text-muted-foreground">{product.description}</p>
                            <time className="text-md text-muted-foreground">{new Date(product.createdAt).toLocaleDateString()}</time>
                        </div>
                    </div>
                )
            ))}
        </div>
    );
}

ProductGrid.propTypes = {
    view: PropTypes.string.isRequired,
    products: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        images: PropTypes.arrayOf(PropTypes.string),
        model: PropTypes.string.isRequired,
        price: PropTypes.number,
        condition: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        description: PropTypes.string,
    })).isRequired,
}

export function AllAds() {
    const { user } = useUser(); // Access the signed-in user's details
    const [view, setView] = useState("grid")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("date-new")
    const [products, setProducts] = useState([])
    const [token, setToken] = useState(null)
    const [selectedAdId, setSelectedAdId] = useState(null) // State to store the clicked ad's ID

    useEffect(() => {
        const tokenFromStorage = localStorage.getItem('token')
        setToken(tokenFromStorage)
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        if (!user || !user.id) {
            alert("User not signed in");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/ads`, {
                method: 'GET',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            const data = await response.json()
            setProducts(data.data)
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleAdClick = (adId) => {
        setSelectedAdId(adId) // Store the ID of the clicked ad
    }

    const handleBackToAllAds = () => {
        setSelectedAdId(null);
    }

    const filteredProducts = products.filter((product) =>
        (product.model && product.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.location && product.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const sortedProducts = React.useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
            if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
            if (sortBy === "date-new") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === "date-old") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return 0;
        });
    }, [filteredProducts, sortBy]);

    return (
        <div className="p-4">
            <p>Number of products: {products.length}</p>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Featured Products</h1>
                <div className="flex flex-1 gap-2 sm:max-w-md">
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 text-black"
                    />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900">
                            <SelectItem value="date-new">Newest First</SelectItem>
                            <SelectItem value="date-old">Oldest First</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={view === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setView("grid")}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setView("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Conditionally render the selected ad details */}
            {selectedAdId ? (
                <div>
                    <Button
                        variant="ghost"
                        onClick={handleBackToAllAds}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Ads
                    </Button>
                    <SingleAd adId={selectedAdId} />
                </div>
            ) : (
                <ProductGrid view={view} products={sortedProducts} onAdClick={handleAdClick} />
            )}
        </div>
    )
}

