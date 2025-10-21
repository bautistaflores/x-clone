import React, { useState, useEffect, useRef } from "react"
import { useUsers } from "../context/UsersContext"
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPostTimestamp } from "../utils/formatPostTimestamp";
import InteractionsPost from "./InteractionsPost";
import RetweetIcon from "./Icons/RetweetIcon";
import ConfigurationIcon from "./Icons/ConfigurationIcon";

import ParentPostDisplay from "./ParentPostDisplay";
import usePostInteractions from "../hooks/usePostInteractions";


function PostCard({ post, isComment = false, postPage = false, commentPage = false }) {
    const { getUser } = useUsers();
    const { user } = useAuth();
    const { deletePost } = usePosts();
    const navigate = useNavigate();

    
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

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
            <div className="relative flex w-full items-center gap-2">
                <div className={`flex w-full ${postPage ? 'flex-col' : 'flex-row gap-1'}`}>
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
                                {formatPostTimestamp(post.created_at, location.pathname, isComment)}
                            </p>
                        </>
                    )}
                </div>

                <div className="relative ml-auto" ref={dropdownRef}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="text-gray-500 hover:bg-blue-500/15 hover:text-blue-500 cursor-pointer rounded-full p-1.5 transition-all duration-200"
                    >
                        <ConfigurationIcon height={18} width={18} color="currentColor"/>
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 bottom-full mb-1 border border-gray-500/50 rounded-xl w-48 bg-black shadow-lg z-10 shadow-white/10"
                        onClick={(e) => e.stopPropagation()}>
                            {user?.username === postUser?.username ? (
                                <button 
                                    className="flex items-center rounded-xl cursor-pointer gap-3 px-4 py-2 w-full hover:bg-[#0a0a0a] text-left font-bold" 
                                    onClick={async () => {
                                        setIsOpen(false);
                                        if (postPage) {
                                            navigate(-1);
                                        }
                                        await deletePost(post.id);
                                    }}
                                >
                                    <span className="text-red-500">Eliminar</span>
                                </button>
                            ) : (
                                <button 
                                    className="flex items-center rounded-xl cursor-pointer gap-3 px-4 py-2 w-full hover:bg-[#0a0a0a] text-left font-bold" 
                                    onClick={async () => {
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="">Denunciar post</span>
                                </button>
                            )}
                        </div>
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
                            <div className="pb-3">
                                {/* contenido */}
                                <p className="leading-none">{post.content}</p>

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
                            <div className="">
                                {/* contenido */}
                                <p>{post.content}</p>

                                {/* imagen */}
                                {post.media_url && (
                                    <img src={`${post.media_url}`} alt="Post" className="w-full h-auto rounded-2xl mt-4" />
                                )}

                                {/* Fecha de publicación formateada */}
                                <p className="text-gray-500 hover:underline hover:cursor-pointer my-3">
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

