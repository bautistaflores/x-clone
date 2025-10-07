import ImgIcon from "./Icons/imgIcon";
import { usePosts } from "../context/PostsContext";
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import { useUsers } from "../context/UsersContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatPostTimestamp } from "../utils/formatPostTimestamp";
import CloseIcon from "./Icons/CloseIcon";

const MAX_CHARACTERS = 280;

function FormPost({isModal = false, isCommentPage = false, parentId: propParentId}) {
    // context
    const { createPost, getPostById, post } = usePosts()
    const { user, isAuthenticated } = useAuth()
    const { profile, getProfile } = useProfiles()
    const { getUser } = useUsers()

    // states
    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [expanded, setExpanded] = useState(false);
    const [parentPost, setParentPost] = useState(null);

    // hooks
    const navigate = useNavigate()
    const location = useLocation()

    // refs
    const fileInputRef = useRef(null)
    const textareaRef = useRef(null)

    const remainingCharacters = MAX_CHARACTERS - content.length;

    const isButtonDisabled = (content.trim().length === 0 && !selectedImage) || content.length > MAX_CHARACTERS;

    const parentId = propParentId || location.state?.parentId || null;

    useEffect(() => {
        const fetchParent = async () => {
            if (!isAuthenticated) return;

            await getProfile(user?.username)

            if (parentId && !isCommentPage) {
                await getPostById(parentId)
            }

            if (parentId && parentId !== post?.id) {
                const comment = await getPostById(parentId)
                setParentPost(comment)
            } else {
                setParentPost(post)
            }
        }

        fetchParent()
    }, [isAuthenticated, user?.username, getProfile, parentId ])

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedImage(null);
            setPreviewImage(null);
        }
    }

    // cerrar modal
    const handleCloseModal = () => {
        if (location.state && location.state.background) {
            navigate(-1) 
        } else if (isCommentPage) {
            setContent('')
            setSelectedImage(null)
            setPreviewImage(null)
        } else {
            navigate('/home')
        }
    }

    // boton svg
    const handleIconClick = () => {
        fileInputRef.current.click();
    }

    // postear
    const handlePostSubmit = async () => {
        if (!isButtonDisabled) {
            const formData = new FormData();
            formData.append('content', content);

            if (parentId) {
                formData.append('parentId', parentId);
            }

            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            await createPost(formData)

            setContent('');
            setSelectedImage(null);
            setPreviewImage(null);
            setExpanded(false);
            handleCloseModal();
        }
    }

    // cambiar contenido del textarea
    const handleContentChange = (e) => {
        const content = e.target.value;
        if (content.length <= MAX_CHARACTERS) {
            setContent(content);
        }
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }

    // expandir textarea
    const handleFocus = () => {
        setExpanded(true);
    }

    // const postUser = getUser(post?.user_id);
    const postUser = parentPost ? getUser(parentPost.user_id) : null;
    
    return (
        <div className="p-3">
            {isCommentPage && postUser && expanded && (
                <div className="flex items-center gap-1 mb-2 ml-14 hover:cursor-pointer">
                    <p className="text-gray-500">Respondiendo a</p>
                    <span className="text-blue-400">@{postUser.username}</span>
                </div>
            )}

            {/* Si es comentario */}
            {parentId && !isCommentPage && postUser && (
                <div>
                    <div className="flex gap-3 mt-2 ml-1 pb-2">
                        {/* imagen de perfil del usuario que posteo */}
                        <div className="flex flex-col flex-shrink-0 w-auto">
                            {postUser.profile_picture && (
                                <img 
                                    src={postUser.profile_picture} 
                                    alt={postUser.username}
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    onClick={(e) => handleProfileClick(e, postUser.username)}
                                />
                            )}

                            <div className="flex-grow w-full flex justify-center">
                                <div className="border-l-2 border-gray-500/50 h-full"></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-row gap-1">
                                    <p 
                                        className="font-bold"
                                    >
                                        {postUser.full_name}
                                    </p>
                                    <p 
                                        className="text-gray-600"
                                    >
                                        @{postUser.username}
                                    </p>
                                    <p className="text-gray-600 font-bold">·</p>

                                    {/* Fecha de publicación formateada */}
                                    {post?.created_at ? (
                                        <p className="text-gray-600">
                                            {formatPostTimestamp(post?.created_at, location.pathname, true)}
                                        </p>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>

                            <div className="pb-2">
                                {/* contenido */}
                                <p>{parentPost?.content}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Seccion postear */}
            <div className="flex gap-3 mt-2 ml-1">
                {/* imagen de perfil */}
                <div className="flex-shrink-0 w-auto">
                    {profile?.profile?.profile_picture && (
                        <img 
                            src={profile?.profile?.profile_picture} 
                            alt={profile?.username}
                            className="w-10 h-10 rounded-full"
                        />
                    )}
                </div>

                {/* formulario */}
                <div className="mt-1 w-full ">
                    <div className="flex flex-row">
                        <textarea 
                            ref={textareaRef}
                            className={`w-full bg-transparent text-xl focus:outline-none placeholder-gray-500 resize-none overflow-hidden ${isModal ? (previewImage ? 'pb' : 'pb-12') : 'pb'}`} 
                            placeholder={parentId ? "Postea tu respuesta" : "¿Qué está pasando?"}
                            onFocus={handleFocus}
                            value={content}
                            onChange={handleContentChange}
                        ></textarea>

                        {isCommentPage && !expanded && (
                            <div>
                                <button 
                                    className={`bg-white text-black font-bold py-2 px-6 rounded-full transition-colors duration-200 
                                        ${isButtonDisabled ? 'opacity-50 cursor-pointer' : ''}`}
                                >
                                    Responder
                                </button>
                            </div>
                        )}
                    </div>

                    {/* imagen previsualizada */}
                    {previewImage && (
                        <div className="relative mb-4">
                            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-xl" />
                            {/* boton eliminar imagen */}
                            <button
                                onClick={() => {
                                    setSelectedImage(null);
                                    setPreviewImage(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }}
                                className="absolute top-1 right-1 cursor-pointer bg-black/50 hover:bg-gray-800/50 transition-colors duration-200 rounded-full p-1.5"
                            >
                                <CloseIcon height={18} width={18}/>
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* boton postear y subir imagen */}
            {(!isCommentPage || expanded) && (
                <div className={`flex justify-between items-center ${isModal || previewImage ? 'border-t border-gray-500/50 pt-2' : ''}`}>
                    {/* boton subir imagen */}
                    <div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange}/>
                        <div className={`cursor-pointer hover:bg-blue-900/20 rounded-full p-2`} onClick={handleIconClick}>
                            <ImgIcon height={22} width={22}/>
                        </div>
                    </div>

                    {/* boton postear */}
                    <div>    
                        <span className={`text-sm mr-4 ${remainingCharacters < 15 ? 'text-red-500' : 'text-gray-500'}`}>
                            {remainingCharacters}
                        </span>
                        <button 
                            className={`bg-white text-black font-bold py-2 px-6 rounded-full transition-colors duration-200 
                                ${isButtonDisabled ? 'opacity-50 cursor-pointer' : 'hover:bg-gray-200 cursor-pointer'}`}
                            disabled={isButtonDisabled}
                            onClick={handlePostSubmit}
                        >
                            {parentId ? 'Responder' : 'Postear'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FormPost;