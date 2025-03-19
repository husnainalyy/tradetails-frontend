import React, { useEffect, useState } from "react";

const PostDetail = () => {
    const id = "67677137830dfe3a4b318c7f"; // Hardcoded for now
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/posts/${id}`);
            const contentType = response.headers.get("content-type");

            if (!response.ok || !contentType.includes("application/json")) {
                throw new Error("Failed to fetch the post");
            }

            const data = await response.json();
            setPost(data.post);
        } catch (err) {
            console.error("Error fetching post:", err);
            setError("An error occurred while fetching the post.");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!post) return;

        const likedByUser = post.likes.includes("user_id"); // Replace with actual user ID
        const updatedLikes = likedByUser
            ? post.likes.filter((id) => id !== "user_id")
            : [...post.likes, "user_id"];

        setPost({ ...post, likes: updatedLikes });

        try {
            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/posts/${id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to update like");
            }
        } catch (err) {
            console.error("Error updating like:", err);
            setPost({
                ...post,
                likes: likedByUser
                    ? [...post.likes, "user_id"]
                    : post.likes.filter((id) => id !== "user_id"),
            });
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        try {
            console.log("New Comment:", newComment);

            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/posts/${id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    comment: newComment,
                    userId: "6755449a3b1b1f73876e1cee", // Replace with actual user ID
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to post comment");
            }

            const data = await response.json();
            // Make sure to update the post state with the new comment
            setPost((prevPost) => ({
                ...prevPost,
                comments: [...prevPost.comments, data.comment],
            }));
            setNewComment(""); // Clear the comment input
        } catch (err) {
            console.error("Error posting comment:", err);
            setError("Failed to post the comment. Please try again.");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="post-detail-container pt-32">
            {/* Author Information */}
            {post.createdBy && (
                <div className="post-author mt-4">
                    <img
                        src={post.createdBy.image}
                        alt={`${post.createdBy.username}'s avatar`}
                        className="author-image"
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            marginBottom: "10px",
                        }}
                    />
                    <p>
                        <strong>{post.createdBy.name}</strong> (@{post.createdBy.username})
                    </p>
                </div>
            )}
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="mt-4">{post.description}</p>

            {/* Images */}
            <div className="post-images mt-6">
                {post.images?.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="post-image"
                        style={{ maxWidth: "100%", marginBottom: "10px" }}
                    />
                ))}
            </div>

            {/* Likes */}
            <div className="post-likes mt-6">
                <button
                    onClick={handleLike}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {post.likes.includes("user_id") ? "Unlike" : "Like"} ({post.likes.length})
                </button>
            </div>

            {/* Comments */}
            <div className="post-comments mt-6">
                <strong>Comments:</strong>
                {post.comments?.length > 0 ? (
                    post.comments.map((comment, index) => (
                        <div key={index} className="comment mt-2">
                            <strong>{comment.userId?.name || "Anonymous"}:</strong> {comment.comment}
                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>

            {/* Add a Comment */}
            <form onSubmit={handleCommentSubmit} className="add-comment mt-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="border p-2 w-full"
                    placeholder="Add a comment..."
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                >
                    Post Comment
                </button>
            </form>

            {/* Shares */}
            <div className="post-shares mt-6">
                <strong>Shares:</strong> {post.shares?.length || 0}
            </div>
        </div>
    );
};

export default PostDetail;