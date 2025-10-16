import React, { useState, useEffect } from "react"
import { useUsers } from "../context/UsersContext"
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPostTimestamp } from "../utils/formatPostTimestamp";
import InteractionsPost from "./InteractionsPost";
import RetweetIcon from "./Icons/RetweetIcon";

import ParentPostDisplay from "./ParentPostDisplay";
import usePostInteractions from "../hooks/usePostInteractions";


function PostCard({ post, isComment = false, postPage = false, commentPage = false }) {
    const { getUser } = useUsers();
    const navigate = useNavigate();
    const { user } = useAuth();

    
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation()
    
    // detecta si estamos en la página de un comentario
    const isCommentPage = location.pathname.startsWith('/post/status/') && post?.parent_id;
    
    const [postUser, setPostUser] = useState(null);
    const [retweetUser, setRetweetUser] = useState(null);

    // logica para los botones de like y retweet
    const {
        isLiked,
        likesCount,
        isRetweeted,
        retweetsCount,
        commentsCount,
        handleLike,
        handleRetweet
    } = usePostInteractions(post);

    useEffect(() => {
        let isMounted = true;

        const fetchUserData = async () => {
            if (!post?.user_id) return;
            try {
                const author = await getUser(post.user_id);
                if (isMounted) setPostUser(author);

                if (post.type === 'retweet' && post.retweetedBy) {
                    const retweetedBy = await getUser(post.retweetedBy);
                    if (isMounted) setRetweetUser(retweetedBy);
                }
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
            }
        };

        fetchUserData();

        return () => { isMounted = false; };
    }, [post]);

    const handleProfileClick = (event, username) => {
        event.stopPropagation();
        navigate(`/${username}`);
    };

    const handleComment = (event) => {
        event.stopPropagation();
        navigate(`/compose/post`, { state: { parentId: post.id, background: location } });
    }

    const profileAndDate = (postPage = false) => {
        return (
            <div className="flex items-center gap-2">
                <div className={`flex ${postPage ? 'flex-col' : 'flex-row gap-1'}`}>
                    <p
                        className={`font-semibold hover:underline hover:cursor-pointer ${postPage ? 'leading-none' : ''}`}
                        onClick={(e) => handleProfileClick(e, postUser.username)}
                    >
                        {postUser.full_name}
                    </p>

                    <p
                        className="text-gray-600 hover:cursor-pointer"
                        onClick={(e) => handleProfileClick(e, postUser.username)}
                    >
                        @{postUser.username}
                    </p>


                    {!postPage && (
                        <>
                            <p className="text-gray-600 font-bold">·</p>
                            <p className="text-gray-600 hover:underline">
                                {formatPostTimestamp(post.created_at, location.pathname, isComment)}.
                            </p>
                        </>
                    )}
                </div>
            </div>
        )
    }

    if (!postUser) {
        return <div className="p-4 flex justify-center items-center min-h-[100px]"></div>;
    }

    return (
        <div className={` ${postPage ? 'pt-2 px-4' : `${commentPage ? '' : 'border-b py-2 px-4 border-gray-500/50'}`}`}>
            {/* Retweet */}
            {post.type === 'retweet' && retweetUser && (
                <div className="mx-6 mb-1">
                    <div className="text-gray-600 text-sm flex items-center gap-2">
                        <RetweetIcon isRetweeted={isRetweeted} width={16} height={16} />
                        <p 
                            className="text-gray-600 hover:underline font-semibold"
                            onClick={(e) => handleProfileClick(e, retweetUser.username)}
                        >
                            {
                                retweetUser.username === user?.username ? (
                                    'Reposteaste'
                                ) : (
                                    retweetUser.full_name + ' reposteó'
                                )
                            }
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                
                {!postPage ? (
                    <>
                        {/* Imagen de perfil */}
                        <div className="flex flex-col flex-shrink-0 w-auto">
                            {postUser.profile_picture && (
                                <img 
                                    src={postUser.profile_picture} 
                                    alt={postUser.username}
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    onClick={(e) => handleProfileClick(e, postUser.username)}
                                />
                            )}

                            {commentPage && (
                                <div className="flex-grow w-full flex justify-center">
                                    <div className="border-l-2 border-gray-500/50 h-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            {/* Usuario y fecha de publicación */}
                            {profileAndDate()}

                            {/* Contenido del post */}
                            <div className="pb-2">
                                {/* contenido */}
                                <p>{post.content}</p>

                                {/* imagen */}
                                {post.media_url && (
                                    <img src={`${post.media_url}`} alt="Post" className="w-full h-auto rounded-2xl mt-4" />
                                )}
                            </div>

                            {/* Botones de retweet, like y comment */}
                            <InteractionsPost
                                handleComment={handleComment}
                                handleRetweet={handleRetweet}
                                handleLike={handleLike}
                                isRetweeted={isRetweeted}
                                isLiked={isLiked}
                                commentsCount={commentsCount}
                                isLoading={isLoading}
                                retweetsCount={retweetsCount}
                                likesCount={likesCount}
                            />
                        </div>
                    </>
                ) : (
                    <div className={`flex flex-col ${isCommentPage ? 'gap-0' : 'gap-2'} w-full`}>
                        {/* Post Padre (solo cuando estamos en la página de un comentario específico) */}
                        {isCommentPage && <ParentPostDisplay parentId={post.parent_id} />}
                        {isCommentPage && (
                            <div className="flex-grow w-full flex ml-[19px] mb-1">
                                <div className="border-l-2 border-gray-500/50 h-[20px]"></div>
                            </div>
                        )}

                        {/* Imagen de perfil y usuario */}
                        <div className="flex flex-row flex-shrink-0 w-auto gap-2">
                            {postUser.profile_picture && (
                                <img 
                                    src={postUser.profile_picture} 
                                    alt={postUser.username}
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    onClick={(e) => handleProfileClick(e, postUser.username)}
                                />
                            )}

                            {/* Usuario */}
                            {profileAndDate(true)}
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            {/* Contenido del post */}
                            <div className="py-2">
                                {/* contenido */}
                                <p>{post.content}</p>

                                {/* imagen */}
                                {post.media_url && (
                                    <img src={`${post.media_url}`} alt="Post" className="w-full h-auto rounded-2xl mt-4" />
                                )}

                                {/* Fecha de publicación formateada */}
                                <p className="text-gray-500 hover:underline hover:cursor-pointer mt-3">
                                    {formatPostTimestamp(post.created_at, location.pathname, isComment)}
                                </p>
                            </div>

                            {/* Botones de retweet, like y comment */}
                            <InteractionsPost
                                handleComment={handleComment}
                                handleRetweet={handleRetweet}
                                handleLike={handleLike}
                                isRetweeted={isRetweeted}
                                isLiked={isLiked}
                                commentsCount={commentsCount}
                                isLoading={isLoading}
                                retweetsCount={retweetsCount}
                                likesCount={likesCount}
                                postPage={true}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostCard

