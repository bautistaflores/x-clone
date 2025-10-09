import { useState, useEffect, useRef } from "react"
import { searchProfilesRequest } from "../api/profiles"
import { useNavigate } from "react-router-dom";
import SearchIcon from "./Icons/SearchIcon"
import CloseIcon from "./Icons/CloseIcon"

// barra de carga
const LoadingBar = () => (
    <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200/50 overflow-hidden">
        <div className="w-full h-full bg-blue-500 [animation:loading-bar_1.5s_linear_infinite]"></div>
    </div>
);

const SearchProfiles = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    const dropdownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // si el query está vacío, limpia los resultados
        if (!query.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        const delayDebounce = setTimeout(async () => {
            try {
                // busca perfiles
                setHasSearched(true);
                const res = await searchProfilesRequest(query);
                setResults(res.data);
            } catch (err) {
                console.error("Error buscando perfiles:", err);
            } finally {
                setLoading(false);
            }

            return () => clearTimeout(delayDebounce);
        }, 400); // espera 400ms después de cada busqueda (letra)

        return () => clearTimeout(delayDebounce);
    }, [query])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (username) => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setHasSearched(false);
        navigate(`/${username}`);
    }

    return (
        <div className="relative w-full max-w-sm mx-auto" ref={dropdownRef}>
            <style>{`@keyframes loading-bar {0% { transform: translateX(-100%); } 100% { transform: translateX(100%); }}`}</style>
            <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <SearchIcon color="#5F6B78" />
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full border border-gray-500/50 rounded-full px-9 py-2 placeholder-gray-500 focus:outline-none focus:ring focus:ring-blue-500" 
                />

                {/* boton para limpiar el input */}
                {query && isOpen && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            setHasSearched(false);
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition cursor-pointer bg-white rounded-full p-1"
                    >
                        <CloseIcon height={12} width={12} color="#000"/>
                    </button>
                )}
            </div>

            {isOpen && !query && (
                <div className="border border-gray-500/50 shadow-sm shadow-white/20 rounded-lg pt-4 pb-7 px-4">
                    <p className="text-gray-500 text-center">Prueba a buscar personas</p>
                </div>
            )}

            {isOpen && query && (
                <ul className="relative border border-gray-500/50 shadow-sm shadow-white/20 rounded-lg overflow-hidden">
                    {loading && <LoadingBar />}

                    {/* primera busqueda, tipo skeleton */}
                    {loading && !hasSearched && (
                        <div className="border border-gray-500/50 shadow-sm shadow-white/20 rounded-lg pt-10 pb-7 px-4"></div>
                    )}

                    {results.length > 0 && results.map((user, i) => (
                        <li
                            key={i}
                            onClick={() => handleSelect(user.username)}
                            className="flex items-center gap-2 py-3 px-4 cursor-pointer hover:bg-gray-500/20"
                        >
                            <img
                                src={user.profile?.profile_picture}
                                alt={user.username}
                                className="w-9 h-9 rounded-full cursor-pointer"
                            />

                            <div className="flex flex-col">
                                <span className="font-semibold text-[17px]">
                                    {user.profile?.full_name}
                                </span>
                                <span className="text-sm text-gray-500">@{user.username}</span>
                            </div>
                        </li>
                    ))}

                    {/* no se encontraron resultados con loading o sin loading*/}
                    {query && results.length === 0 && hasSearched && (
                        <li className="py-3 px-4">
                            {loading ? (
                            <span className="text-gray-500 animate-pulse">No se encontraron resultados.</span>
                            ) : (
                            <span className="text-gray-500">No se encontraron resultados.</span>
                            )}
                        </li>
                    )}
                </ul>
            )}
        </div>
    )
}

export default SearchProfiles