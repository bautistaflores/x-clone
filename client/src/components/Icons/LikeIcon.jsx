import React from 'react';

function LikeIcon({ isLiked, width = 20, height = 20 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" 
        fill={isLiked ? 'red' : 'none'} stroke={'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
        </svg>
    );
}

export default LikeIcon;