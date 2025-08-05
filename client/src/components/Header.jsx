import { useAuth } from "../context/AuthContext"
import { Link, useLocation } from 'react-router-dom';

import LogoIcon from "../components/Icons/LogoIcon";
import HomeIcon from "../components/Icons/HomeIcon";
import NotificationIcon from "../components/Icons/NotificationIcon";
import PerfilIcon from "../components/Icons/PerfilIcon";

function Header() {
    const { user, logout } = useAuth()
    
    const location = useLocation()

    return (
        <header className="fixed w-3/10 justify-items-end">
            <div className="flex flex-col px-4 max-w-screen-lg text-xl">
                <Link to="/">
                    <div className="inline-flex items-center hover:bg-[#1e1e1e] rounded-full p-4 m-2">
                        <LogoIcon height={30} width={30}/>
                    </div>
                </Link>
                <Link to="/">
                    <div className="inline-flex items-center gap-5 hover:bg-[#1e1e1e] rounded-full px-4 pr-7 py-3 m-2">
                        <HomeIcon height={25} width={25} />
                        <span>Inicio</span>
                    </div>
                </Link>
                <Link to="/notificaciones">
                    <div className="inline-flex items-center gap-5 hover:bg-[#1e1e1e] rounded-full px-4 pr-7 py-3 m-2">
                        <NotificationIcon height={25} width={25} />
                        <span>Notificaciones</span>
                    </div>
                </Link>
                <Link to={`/${user.username}`}>
                    <div className="inline-flex items-center gap-5 hover:bg-[#1e1e1e] rounded-full px-4 pr-7 py-3 m-2">
                        <PerfilIcon height={25} width={25} />
                        <span>Perfil</span>
                    </div>
                </Link>
                <Link to="/compose/post" state={{ background: location }}>
                    <div className="gap-2 px-4 py-2 m-2">
                        <span className="cursor-pointer bg-white text-black px-18 py-2.5 hover:bg-gray-200 font-semibold text-lg rounded-full">Postear</span>
                    </div>
                </Link>
                <Link to='/' onClick={() => { logout() }}>
                    <div className="inline-flex items-center gap-2 hover:bg-[#1e1e1e] rounded-full px-4 pr-7 py-3 m-2">
                        <span>Logout</span>
                    </div>
                </Link>
            </div>
        </header>
    )
}

export default Header;