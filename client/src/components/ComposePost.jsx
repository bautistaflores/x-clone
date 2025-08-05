import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { usePosts } from "../context/PostsContext";
import CloseIcon from "./Icons/CloseIcon";

const MAX_CHARACTERS = 280;

function ComposePost() {
    const { createPost } = usePosts()
    const navigate = useNavigate()
    const location = useLocation()
    const textareaRef = useRef(null)

    const [content, setContent] = useState('');

    const remainingCharacters = MAX_CHARACTERS - content.length;

    const isButtonDisabled = content.trim().length === 0 || content.length > MAX_CHARACTERS;

    const handleCloseModal = () => {
        if (location.state && location.state.background) {
            navigate(-1)
        } else {
            navigate('/home')
        }
    }

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

    const handlePostSubmit = async () => {
        if (!isButtonDisabled) {
            await createPost({ content })
            setContent('');
            handleCloseModal();
        }
    }

    return (
        // fondosemi-transparente
        <div style={{ backgroundColor: 'rgba(91, 112, 131, 0.4)' }} className="fixed inset-0 flex items-start justify-center pt-10 z-50">
            <div className="bg-black text-white rounded-2xl p-3 w-full max-w-xl">
                {/* boton cerrar */}
                <div>
                    <button onClick={handleCloseModal} className="cursor-pointer hover:bg-gray-900 rounded-full p-2">
                        <CloseIcon />
                    </button>
                </div>

                {/* formulario */}
                <div className="py-4">
                    <textarea 
                        ref={textareaRef}
                        className="w-full pb-5 bg-transparent text-lg focus:outline-none placeholder-gray-500 resize-none overflow-hidden" 
                        placeholder="¿Qué está pasando?"
                        value={content}
                        onChange={handleContentChange}
                    ></textarea>
                </div>

                {/* boton postear */}
                <div className="flex justify-end">
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
    )
}

export default ComposePost;