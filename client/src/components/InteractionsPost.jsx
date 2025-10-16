import React from 'react';
import CommentIcon from "./Icons/CommentIcon";
import RetweetIcon from "./Icons/RetweetIcon";
import LikeIcon from "./Icons/LikeIcon";

function InteractionsPost({ handleComment, handleRetweet, handleLike, isCommented, isRetweeted, isLiked, isLoading, retweetsCount, likesCount, commentsCount, postPage = false }) {

    return (
        // Botones de retweet, like y comment
        <div className={`flex flex-rows gap-20 ${postPage ? 'border-y border-gray-500/50 py-2' : ''}`}>
            {/* Comment */}
            <div className="w-24">
                <button
                    onClick={handleComment}
                    disabled={isLoading}
                    className={`group flex items-center justify-center rounded-full text-gray-500
                        ${isCommented ? 'text-blue-500' : 'hover:text-blue-400'}
                        ${isLoading ? 'opacity-50' : 'cursor-pointer'}
                    }`}>

                    {/* Comment icon */}
                    <div className="group-hover:bg-blue-500/15 rounded-full p-1.5">
                        <CommentIcon />
                    </div>

                    {/* Comments count */}
                    <span>{commentsCount}</span>
                </button>
            </div>

            {/* Retweet */}
            <div className="w-24">
                <button 
                    onClick={handleRetweet}
                    disabled={isLoading}
                    className={`group flex items-center justify-center rounded-full text-gray-500
                        ${isRetweeted ? 'text-green-500' : 'hover:text-green-500'}
                        ${isLoading ? 'opacity-50' : 'cursor-pointer'}
                    }`}>

                    {/* Retweet icon */}
                    <div className="group-hover:bg-green-500/10 rounded-full p-1.5">
                        <RetweetIcon isRetweeted={isRetweeted} />
                    </div>

                    {/* Retweets count */}
                    <span>{retweetsCount}</span>
                </button>
            </div>

            {/* Like */}
            <div className="w-24">
                <button 
                    onClick={handleLike}
                    disabled={isLoading}
                    className={`group flex items-center justify-center rounded-full text-gray-500
                        ${isLiked ? 'text-red-500' : ' hover:text-red-500'}
                        ${isLoading ? 'opacity-50' : 'cursor-pointer'}
                    }`}>

                    {/* Like icon */}
                    <div className="group-hover:bg-red-500/10 rounded-full p-1.5">
                        <LikeIcon isLiked={isLiked} />
                    </div>

                    {/* Likes count */}
                    <span>{likesCount}</span>
                </button>
            </div>
        </div>
    )
}

export default InteractionsPost;