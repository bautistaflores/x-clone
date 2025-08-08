import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { usePosts } from "../context/PostsContext";
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import CloseIcon from "./Icons/CloseIcon";
import ImgIcon from "./Icons/imgIcon";

const MAX_CHARACTERS = 280;

function ComposePost() {
    // context
    const { createPost } = usePosts()
    const { user, isAuthenticated } = useAuth()
    const { profile, getProfile } = useProfiles()

    // hooks
    const navigate = useNavigate()
    const location = useLocation()

    // refs
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)
    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const remainingCharacters = MAX_CHARACTERS - content.length;

    const isButtonDisabled = (content.trim().length === 0 && !selectedImage) || content.length > MAX_CHARACTERS;

    useEffect(() => {
        if (isAuthenticated) {
            getProfile(user?.username)
        }
    }, [isAuthenticated, user?.username, getProfile])

    // cerrar modal
    const handleCloseModal = () => {
        if (location.state && location.state.background) {
            navigate(-1)
        } else {
            navigate('/home')
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

    // postear
    const handlePostSubmit = async () => {
        if (!isButtonDisabled) {
            const formData = new FormData();
            formData.append('content', content);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }
            await createPost(formData)

            setContent('');
            setSelectedImage(null);
            setPreviewImage(null);
            handleCloseModal();
        }
    }

    // boton svg
    const handleIconClick = () => {
        fileInputRef.current.click();
    }

    return (
        // fondosemi-transparente
        <div style={{ backgroundColor: 'rgba(91, 112, 131, 0.4)' }} className="fixed inset-0 flex items-start justify-center pt-10 z-50">
            <div className="bg-black text-white rounded-2xl p-3 w-full max-w-xl">
                {/* boton cerrar */}
                <div>
                    <input type="file" accept="image/*" className="hidden" />
                    <button onClick={handleCloseModal} className="cursor-pointer hover:bg-gray-900 rounded-full p-2">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex gap-3 mt-4 ml-2">
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
                    <div className="mt-1 w-full">
                        <textarea 
                            ref={textareaRef}
                            className={`w-full bg-transparent text-xl focus:outline-none placeholder-gray-500 resize-none overflow-hidden ${previewImage ? 'pb' : 'pb-12'}`} 
                            placeholder="¿Qué está pasando?"
                            value={content}
                            onChange={handleContentChange}
                        ></textarea>

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
                <div className="flex justify-between items-center border-t border-gray-500/50 pt-2">
                    {/* boton subir imagen */}
                    <div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange}/>
                        <div className="cursor-pointer hover:bg-blue-900/20 rounded-full p-2" onClick={handleIconClick}>
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
                                ${isButtonDisabled ? 'opacity-50' : 'hover:bg-gray-200 cursor-pointer'}`}
                            disabled={isButtonDisabled}
                            onClick={handlePostSubmit}
                        >
                            Postear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComposePost;