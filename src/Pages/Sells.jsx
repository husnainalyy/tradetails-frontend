import { useState, useCallback, useEffect, useRef } from "react"
import { MapPin, Smartphone, DollarSign, X, Upload } from 'lucide-react'
import axios from 'axios'
import { useUser } from "@clerk/clerk-react";

// Use Vite's way of importing environment variables
const GOOGLE_MAPS_API_KEY = 'AIzaSyAPYQA3RzGawuiNBW0mzOHSLvbdAf6aUVA'

// Helper function to load Google Maps API script
const loadGoogleMapsApi = () => {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places"]`);
        if (existingScript) {
            if (window.google && window.google.maps) {
                resolve();
            } else {
                existingScript.onload = () => resolve();
                existingScript.onerror = () => reject(new Error('Failed to load Google Maps API'));
            }
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps API'));
        document.head.appendChild(script);
    });
};


export default function SellPage() {
    const [model, setModel] = useState("")
    const [location, setLocation] = useState("")
    const [locationQuery, setLocationQuery] = useState("")
    const [locationPredictions, setLocationPredictions] = useState([])
    const [images, setImages] = useState([])
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [condition, setCondition] = useState("new")
    const [specifications, setSpecifications] = useState(null)
    const [isLoadingSpecs, setIsLoadingSpecs] = useState(false)
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sketchfabModel, setSketchfabModel] = useState  (null)
    const [isLoadingModel, setIsLoadingModel] = useState(false)
    const { user } = useUser(); // Access the signed-in user's details

    const autocompleteService = useRef(null)
    const searchRef = useRef(null)

    useEffect(() => {
        let isMounted = true;

        const initGoogleMaps = async () => {
            if (!GOOGLE_MAPS_API_KEY) {
                console.error('Google Maps API key is missing');
                return;
            }

            try {
                await loadGoogleMapsApi();
                if (isMounted) {
                    setIsGoogleMapsLoaded(true);
                }
            } catch (error) {
                console.error('Error loading Google Maps API:', error);
            }
        };

        initGoogleMaps();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (isGoogleMapsLoaded && !autocompleteService.current) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, [isGoogleMapsLoaded]);


    useEffect(() => {
        if (isGoogleMapsLoaded && locationQuery && !location) {
            console.log("Querying Autocomplete for:", locationQuery);

            if (!autocompleteService.current) {
                console.warn("AutocompleteService is not initialized yet.");
                return;
            }

            autocompleteService.current.getPlacePredictions(
                { input: locationQuery, componentRestrictions: { country: 'pk' } },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        console.log("Predictions received:", predictions);
                        setLocationPredictions(predictions);
                    } else {
                        console.error("Failed to fetch predictions. Status:", status);
                        setLocationPredictions([]);
                    }
                }
            );
        } else {
            setLocationPredictions([]);
        }
    }, [locationQuery, isGoogleMapsLoaded, location]);


    const handleImageUpload = useCallback((event) => {
        const files = event.target.files
        if (!files) return

        if (images.length + files.length > 9) {
            alert('You can only upload a maximum of 9 images.')
            return
        }

        const newImages = Array.from(files).map(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is 5MB.`)
                return null
            }
            return {
                url: URL.createObjectURL(file),
                file
            }
        }).filter(Boolean)

        setImages(prev => [...prev, ...newImages])
    }, [images])

    const removeImage = useCallback((index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleLocationSelect = (description) => {
        setLocation(description);
        setLocationQuery(description);
        setLocationPredictions([]); // Clear predictions after selection
    };


    const fetchSpecifications = async () => {
        if (!model) {
            return
        }

        setIsLoadingSpecs(true)
        try {
            const response = await fetch('https://tradetails-backend-production.up.railway.app/api/ads/specs', {
                method: 'POST',
                headers: {
                    Authorization: `Clerk ${user.id}`, 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model: model })
            })

            if (!response.ok) {
                throw new Error('Failed to fetch specifications')
            }

            const data = await response.json()
            setSpecifications(data.specs)
        } catch (error) {
            console.error('Error fetching specifications:', error)
        } finally {
            setIsLoadingSpecs(false)
        }
    }

    const fetchSketchfabModel = async (query) => {
        const API_URL = 'https://api.sketchfab.com/v3/search';
        const API_KEY = '6787bc73c2974d8ab7f6acc472d150da';

        try {
            const response = await axios.get(API_URL, {
                params: {
                    type: 'models',
                    q: query,
                    downloadable: true,
                },
                headers: {
                    Authorization: `Token ${API_KEY}`,
                },
            });

            if (response.data.results.length > 0) {
                const model = response.data.results[0];
                return {
                    id: model.uid,
                    name: model.name,
                    thumbnail: model.thumbnails.images[0].url,
                    embedUrl: `https://sketchfab.com/models/${model.uid}/embed`,
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching model:', error);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchModel = async () => {
            if (!model) return;

            setIsLoadingModel(true);
            try {
                const fetchedModel = await fetchSketchfabModel(model);
                if (isMounted) {
                    setSketchfabModel(fetchedModel);
                }
            } catch (error) {
                console.error('Error fetching 3D model:', error);
            } finally {
                if (isMounted) {
                    setIsLoadingModel(false);
                }
            }
        };

        fetchModel();

        return () => {
            isMounted = false;
        };
    }, [model]);

    const resetForm = useCallback(() => {
        setModel("")
        setLocation("")
        setLocationQuery("")
        setImages([])
        setDescription("")
        setPrice("")
        setCondition("new")
        setSpecifications(null)
        setSketchfabModel(null)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const requiredFields = { model, location, condition, price, description }
        const missingFields = Object.entries(requiredFields).filter(([_, value]) => !value)

        if (missingFields.length > 0) {
            alert(`Please fill in the following fields: ${missingFields.map(([field]) => field).join(', ')}`)
            return
        }

        if (images.length === 0) {
            alert('Please upload at least one image.')
            return
        }

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('brand', model)
            formData.append('location', location)
            formData.append('price', price)
            formData.append('condition', condition)
            formData.append('description', description)

            images.forEach((image) => {
                formData.append(`images`, image.file)
            })

            if (specifications) {
                formData.append('specifications', JSON.stringify(specifications))
            }

            if (sketchfabModel) {
                formData.append('sketchfabModel', JSON.stringify(sketchfabModel))
            }
            if (!user || !user.id) {
                alert("User not signed in");
                return;
            }
            console.log("user id", user.id)

            const response = await fetch('https://tradetails-backend-production.up.railway.app/api/ads', {
                method: 'POST',
                headers: {
                    Authorization: `Clerk ${user.id}`, // Dynamically send the clerkUserId
                },
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create ad')
            }

            resetForm()
        } catch (error) {
            console.error('Error posting ad:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex-1 p-6 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">List Your Device</h1>
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Reset Form
                    </button>
                </div>

                <div className="bg-[#111827] rounded-xl p-6 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Upload Images (Max 9)
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="dropzone-file"
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800 border-gray-700"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG or GIF (MAX. 800x400px)
                                        </p>
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={images.length >= 9}
                                    />
                                </label>
                            </div>
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.url}
                                                alt={`Uploaded image ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Model and Price */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Model
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        placeholder="Enter model (e.g., iPhone 12 Pro)"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={fetchSpecifications}
                                    disabled={isLoadingSpecs || !model}
                                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors"
                                >
                                    {isLoadingSpecs ? "Loading..." : "Get Specifications"}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Price
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="Enter price"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Search your location"
                                    value={locationQuery}
                                    onChange={(e) => {
                                        setLocationQuery(e.target.value)
                                        setLocation("")
                                    }}
                                    className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={!isGoogleMapsLoaded}
                                />
                                {locationQuery && (
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        onClick={() => {
                                            setLocationQuery('')
                                            setLocation('')
                                            setLocationPredictions([])
                                            if (searchRef.current) searchRef.current.focus()
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            {locationPredictions.length > 0 && !location && (
                                <div className="relative">
                                    <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
                                        {locationPredictions.map((prediction) => (
                                            <div
                                                key={prediction.place_id}
                                                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                                                onClick={() => handleLocationSelect(prediction.description)}
                                            >
                                                <p className="text-sm text-white">{prediction.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Condition */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Condition</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['new', 'like-new', 'used'].map((value) => (
                                    <label
                                        key={value}
                                        className={`flex items-center space-x-2 rounded-lg border ${condition === value ? 'border-blue-500 bg-gray-800' : 'border-gray-700'
                                            } p-4 cursor-pointer hover:bg-gray-800 transition-colors`}
                                    >
                                        <input
                                            type="radio"
                                            name="condition"
                                            value={value}
                                            checked={condition === value}
                                            onChange={(e) => setCondition(e.target.value)}
                                            className="hidden"
                                        />
                                        <span className="capitalize">{value.replace('-', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your device..."
                                className="w-full min-h-[100px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={500}
                            />
                            <p className="text-sm text-gray-400">
                                Character count: {description.length}/500
                            </p>
                        </div>

                        {/* Specifications */}
                        {specifications && (
                            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold">Specifications</h3>
                                {Object.entries(specifications).map(([category, specs]) => (
                                    <div key={category} className="space-y-2">
                                        <h4 className="font-medium">{category}</h4>
                                        <ul className="grid gap-2">
                                            {Object.entries(specs).map(([key, value]) => (
                                                <li key={key} className="text-sm text-gray-400">
                                                    <span className="font-medium text-white">{key}:</span> {value}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3D Model Preview */}
                        {isLoadingModel && (
                            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                                <p className="text-center text-gray-400">Loading 3D model...</p>
                            </div>
                        )}

                        {sketchfabModel && (
                            <div className="mt-4 space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">3D Model Preview</h3>
                                    <p className="text-sm text-gray-400">{sketchfabModel.name}</p>
                                </div>
                                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                    <iframe
                                        title="Sketchfab Model"
                                        className="absolute inset-0 w-full h-full rounded-lg"
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
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4 mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
                            >
                                {isSubmitting ? "Posting..." : "Post Your Ad"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

