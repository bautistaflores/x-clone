import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useProfiles } from "../context/ProfilesContext"

function ProfilePage() {
    const { profile, getProfile, loading, error } = useProfiles()
    const { username } = useParams()

    useEffect(() => {
        getProfile(username)
    }, [username, getProfile])

    if (loading) {
        return (
            <div>
                <p>Cargando perfil...</p>
            </div>
        )
    }

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
        <div>
            <h1 >{profile.username}</h1>
            <a href="/update-profile">Update Profile</a>
 
            {profile.profile?.full_name && ( 
                <h2>{profile.profile.full_name}</h2>
            )}

            {profile.profile?.profile_picture ? (
                <div>
                    <img 
                        src={profile.profile.profile_picture}
                        alt={`Foto de perfil de ${profile.username}`} 
                        className="w-48 h-48"
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
            
            {profile.profile?.bio && (
                <div>
                    <p>{profile.profile.bio}</p>
                </div>
            )}
        </div>
    )
}

export default ProfilePage