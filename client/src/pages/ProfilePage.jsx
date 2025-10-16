import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useProfiles } from "../context/ProfilesContext"
import { usePosts } from "../context/PostsContext"
import { useAuth } from "../context/AuthContext"
import PostCard from "../components/PostCard"
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LoadingIcon from "../components/Icons/LoadingIcon"

function ProfilePage() {
    const { profile, getProfile, loading: profileLoading, error } = useProfiles()
    const { user } = useAuth()
    const { username } = useParams()
    const { userPosts, getPostsByUsername, loading: postsLoading } = usePosts()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        getProfile(username)
        getPostsByUsername(username)
    }, [username, getProfile])

    const handlePostClick = (postId) => {
        navigate(`/post/status/${postId}`);
    };

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
            <div className="border-l border-r border-b border-gray-500/50">
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
                        {user?.username === profile?.username && (
                            <div>
                                <Link to="/settings/profile" state={{ background: location }} className="font-bold border border-gray-500/50 rounded-full px-4 py-2 hover:bg-gray-500/20 duration-200">Editar perfil</Link>
                            </div>
                        )}
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
            <div className="min-h-[1000px] border-x border-gray-500/50">
                {postsLoading ? (
                    <div className="h-[1000px] border-x border-gray-500/50">
                        <LoadingIcon />
                    </div>
                ) : (
                    userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <div
                                key={post.type === 'retweet' ? post.retweetedId : post.id}
                                onClick={() => handlePostClick(post.id)}
                                className="hover:cursor-pointer hover:bg-[#070707]"
                            >
                                <PostCard post={post} />
                            </div>
                        ))
                    ) : (
                        <div className="h-[1000px] border-x border-gray-500/50">
                            <h1 className="text-center font-bold text-xl text-gray-500">. . .</h1>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default ProfilePage