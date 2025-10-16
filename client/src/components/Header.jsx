import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import LogoIcon from "../components/Icons/LogoIcon";
import HomeIcon from "../components/Icons/HomeIcon";
import NotificationIcon from "../components/Icons/NotificationIcon";
import PerfilIcon from "../components/Icons/PerfilIcon";
import ConfigurationIcon from "../components/Icons/ConfigurationIcon";

function Header() {
    const { user, logout } = useAuth();
    const { profile } = useProfiles();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const location = useLocation();

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

    return (
        <>
            {/* --- overlay bloqueador --- */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-transparent z-[9998]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <header className="fixed top-0 left-0 w-19/60 justify-items-end h-screen z-[9999]">
                <div className="flex flex-col px-4 max-w-screen-lg text-xl h-full">
                    <Link to="/home">
                        <div className="inline-flex items-center hover:bg-[#1e1e1e] rounded-full p-4 m-2">
                            <LogoIcon height={30} width={30} />
                        </div>
                    </Link>

                    <Link to="/home">
                        <div className="inline-flex items-center gap-5 hover:bg-[#1e1e1e] rounded-full px-4 pr-7 py-3 m-2">
                            <HomeIcon height={25} width={25} isActive={location.pathname === "/home"} />
                            <span>Inicio</span>
                        </div>
                    </Link>

                    <Link to="/notificaciones">
                        <div className="inline-flex items-center gap-5 hover:bg-[#1e1e1e] rounded-full px-4 pr-7 py-3 m-2">
                            <NotificationIcon
                                height={25}
                                width={25}
                                isActive={location.pathname === "/notificaciones"}
                            />
                            <span>Notificaciones</span>
                        </div>
                    </Link>

                    <Link to={`/${user.username}`}>
                        <div className="inline-flex items-center gap-5 hover:bg-[#1e1e1e] rounded-full px-4 pr-7 py-3 m-2">
                            <PerfilIcon
                                height={25}
                                width={25}
                                isActive={location.pathname === `/${user.username}`}
                            />
                            <span>Perfil</span>
                        </div>
                    </Link>

                    <Link to="/compose/post" state={{ background: location }}>
                        <div className="gap-2 px-4 py-2 m-2">
                            <span className="cursor-pointer bg-white text-black px-18 py-2.5 hover:bg-gray-200 font-semibold text-lg rounded-full">
                                Postear
                            </span>
                        </div>
                    </Link>

                    {/* --- perfil y cerrar sesión --- */}
                    {user && (
                        <div className="relative mt-auto" ref={dropdownRef}>
                            <div
                                className="flex mt-auto items-center gap-3 px-4 py-2 ml-2 my-4 cursor-pointer hover:bg-[#1e1e1e] transition-all duration-200 rounded-full"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <img
                                    src={user?.profile?.profile_picture}
                                    alt={user.username}
                                    className="w-9 h-9 rounded-full cursor-pointer"
                                />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-[17px]">
                                        {user?.profile?.full_name}
                                    </span>
                                    <span className="text-sm text-gray-500">@{user?.username}</span>
                                </div>

                                <div className="ml-auto">
                                    <ConfigurationIcon height={20} width={20} />
                                </div>
                            </div>

                            {isOpen && (
                                <div
                                    className="absolute bottom-full left-0 py-4 mb-2 border border-gray-500/50 rounded-xl min-w-[280px] bg-black z-[9999]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="inline-flex pl-2 py-2 w-full hover:bg-[#1e1e1e] text-left cursor-pointer"
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="text-[16px] font-semibold">
                                            Cerrar la sesión de <br /> @{user?.username}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}

export default Header;
