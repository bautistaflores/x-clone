import { useEffect, useState } from 'react';
import { getMyProfileRequest } from '../api/profiles';
import { useProfiles } from '../context/ProfilesContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CloseIcon from '../components/Icons/CloseIcon';
import CameraIcon from '../components/Icons/CameraIcon';

function UpdateProfilePage() {
    const navigate = useNavigate();
    const { authLoading, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { updateProfile } = useProfiles();
    const [formData, setFormData] = useState({
        profile: {
            full_name: '',
            bio: '',
        }
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const location = useLocation()

    const handleCloseModal = () => {
        if (location.state && location.state.background) {
            navigate(-1)
        } else {
            navigate('/home')
        }
    }

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login');
            return
        }

        const fetchProfile = async () => {
            const res = await getMyProfileRequest();
            setFormData(res.data);
        }
        fetchProfile();
    }, [authLoading, isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                [name]: value
            }
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            // Crear URL para previsualización
            const imageUrl = URL.createObjectURL(file);
            setPreviewUrl(imageUrl);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await updateProfile(formData, selectedImage);

            if (response && response.success) {
                navigate(`/${formData.username}`);
            }
            

        } catch (error) {
            setError(error.response?.data?.error || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'rgba(91, 112, 131, 0.4)' }} className="fixed inset-0 flex items-start justify-center pt-10 z-9999">
            <div className=" bg-black rounded-2xl w-full max-w-xl">

                <div className="flex items-center">
                    <input type="file" accept="image/*" className="hidden" />
                    <button onClick={handleCloseModal} className="cursor-pointer hover:bg-[#1e1e1e] rounded-full p-2 m-2">
                        <CloseIcon />
                    </button>
                    <h1 className="text-2xl font-bold ml-10">Editar perfil</h1>

                    {/* Botón de envío */}
                    <button
                        type="submit"
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className={`ml-auto mr-3 cursor-pointer hover:bg-[#1e1e1e] rounded-full p-2 m-2 font-semibold text-black
                            ${loading ? 'bg-blue-400' : 'bg-white hover:bg-gray-200'} 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form className="space-y-6 mx-4 mb-10">
                    {/* Sección de imagen de perfil */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                            <label htmlFor="profile-picture-upload" className="cursor-pointer">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-black group">
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img 
                                            src={formData.profile?.profile_picture || '/images/default_profile.webp'}
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    )}

                                    <div className="absolute inset-0 bg-gray-800/30 flex items-center justify-center">
                                        <div className="bg-gray-800/90 rounded-full p-2.5 hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer">
                                            <CameraIcon className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <input
                                id="profile-picture-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Campo de nombre */}
                    <div className="relative border border-gray-500 rounded-sm py-1 px-2 focus-within:border-blue-400 focus-within:border-2">
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData?.profile?.full_name || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md outline-none"
                        />
                    </div>

                    {/* Campo de biografía */}
                    <div className="relative border border-gray-500 rounded-sm py-1 px-2 focus-within:border-blue-400 focus-within:border-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            Biografía
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData?.profile?.bio || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md outline-none resize-none"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateProfilePage;