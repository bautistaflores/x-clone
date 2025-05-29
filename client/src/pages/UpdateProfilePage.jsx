import { useEffect, useState } from 'react';
import { getProfileRequest, updateProfileRequest, uploadProfilePictureRequest } from '../api/profiles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UpdateProfilePage() {
    const navigate = useNavigate();
    const { authLoading, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        bio: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login');
            return
        }

        getProfileRequest().then(res => {
            setFormData(res.data);
        });

    }, [authLoading, isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            // Primero subir la imagen si hay una seleccionada
            if (selectedImage) {
                await uploadProfilePictureRequest(selectedImage);
            }

            // Luego actualizar el perfil
            await updateProfileRequest(formData);
            
            // Redirigir al perfil o mostrar mensaje de éxito
            navigate('/home');
        } catch (error) {
            setError(error.response?.data?.error || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Actualizar Perfil</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Sección de imagen de perfil */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Foto de Perfil
                    </label>
                    <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <img 
                                        src={formData.profile_picture || ''} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>
                </div>

                {/* Campo de nombre */}
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                        Nombre Completo
                    </label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Tu nombre completo"
                    />
                </div>

                {/* Campo de biografía */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Biografía
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Cuéntanos sobre ti..."
                    />
                </div>

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                    {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                </button>
            </form>
        </div>
    );
}

export default UpdateProfilePage;