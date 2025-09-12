import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useProfiles } from "../context/ProfilesContext"
import { usePosts } from "../context/PostsContext"
import PostCard from "../components/PostCard"
import { useNavigate } from 'react-router-dom';
import LoadingIcon from "../components/Icons/LoadingIcon"

function ProfilePage() {
    const { profile, getProfile, loading: profileLoading, error } = useProfiles()
    const { username } = useParams()
    const { posts, getPostsByUsername, loading: postsLoading } = usePosts()
    const navigate = useNavigate()

    useEffect(() => {
        getProfile(username)
    }, [username, getProfile])

    useEffect(() => {
        getPostsByUsername(username)
    }, [username])

    const handlePostClick = (postId) => {
        navigate(`/post/status/${postId}`);
    };

    // if (loading) {
    //     return (
    //         <div>
    //             <p>Cargando perfil...</p>
    //         </div>
    //     )
    // }

    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
            </div>
        )
    }

    if (!profile) {
        return (
            <div>
                <p>El perfil de "{username}" no fue encontrado.</p>
            </div>
        )
    }

    return (
        <div className="">
            <div className="border-l border-r border-b border-gray-600">
                <div className="px-4 py-3">   
                    <div className="flex flex-row gap-2 justify-between">
                        {/* Foto de perfil y boton update profile */}
                        <div>
                            {profile.profile?.profile_picture ? (
                                <div>
                                    <img 
                                        src={profile.profile.profile_picture}
                                        alt={`Foto de perfil de ${profile.username}`} 
                                        className="w-33 h-33 rounded-full border-3 border-black cursor-pointer"
                                        onError={(e) => { e.target.src = '/images/default_profile.webp'; }}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <div>
                                        Sin foto
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <a href="/update-profile" className="font-bold border border-gray-600 rounded-full px-4 py-2 hover:bg-gray-600/20 duration-200">Editar perfil</a>
                        </div>
                    </div>

                    {/* Nombre y username */}
                    <div>
                        {profile.profile?.full_name && ( 
                            <h2 className="font-bold text-xl">{profile.profile.full_name}</h2>
                        )}
                        
                        <h1 className="text-gray-500">@{profile.username}</h1>
                    </div>

                    {/* Bio */}
                    <div>
                        {profile.profile?.bio && (
                            <p>{profile.profile.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* posts del perfil */}
            <div>
                {postsLoading ? (
                    <LoadingIcon />
                ) : (
                    posts.length > 0 ? (
                        posts.map(post => (
                            <div
                                key={post.type === 'retweet' ? post.retweetedId : post.id}
                                onClick={() => handlePostClick(post.id)}
                                className="hover:cursor-pointer hover:bg-[#070707]"
                            >
                                <PostCard post={post} />
                            </div>
                        ))
                    ) : (
                        <h1>No hay posts</h1>
                    )
                )}
            </div>
        </div>
    )
}

export default ProfilePage