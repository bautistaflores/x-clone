function PostCard({ post }) {
    return (
        <div>
            <p>id: {post.id}</p>
            <p>Post de user: {post.user_id}</p>
            <p>{post.content}</p>
        </div>
    )
}

export default PostCard