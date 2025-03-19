import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react"; // Import the useUser hook from Clerk

const CreatePost = () => {
    const { user } = useUser(); // Access the user object from Clerk
    const userId = user?.id; // Dynamically get the userId from Clerk

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!userId) {
            setError("User not found. Please log in again.");
            setLoading(false);
            return;
        }

        // Log to check values before sending
        console.log("Title:", title);
        console.log("Description:", description);
        console.log("User ID (Creator):", userId);

        if (!title || !description || !userId) {
            setError("Title, description, and userId are required.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("userId", userId); // Add the userId (creator)

        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }

        try {
            console.log("Submitting form data...");
            const token = localStorage.getItem("token");
            console.log("Authorization Token:", token); // Log the token

            const response = await fetch("https://tradetails-backend-production.up.railway.app/api/posts", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // Ensure token is valid
                },
                body: formData,
            });

            const responseText = await response.text(); // Get raw response text
            console.log("Response Text:", responseText);

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${responseText}`);
            }

            const data = JSON.parse(responseText); // Parse JSON manually
            alert("Post created successfully!");
            navigate(`/post/${data.post._id}`); // Redirect to the new post
        } catch (error) {
            console.error("Error during post creation:", error);
            setError(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container mx-auto p-6 mt-40">
            <h1 className="text-3xl font-semibold mb-4">Create New Post</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-lg font-semibold">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-lg font-semibold">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                        rows="5"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="images" className="block text-lg font-semibold">Images</label>
                    <input
                        type="file"
                        id="images"
                        multiple
                        onChange={handleImageChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 text-white rounded-md ${loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                    {loading ? "Creating..." : "Create Post"}
                </button>
            </form>
        </div>
    );
};

export default CreatePost;