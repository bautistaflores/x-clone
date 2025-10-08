import { useNavigate, useLocation } from "react-router-dom";
import CloseIcon from "./Icons/CloseIcon";
import FormPost from "./FormPost";


function ComposePost() {
    // hooks
    const navigate = useNavigate()
    const location = useLocation()

    const handleCloseModal = () => {
        if (location.state && location.state.background) {
            navigate(-1)
        } else {
            navigate('/home')
        }
    }

    return (
        // fondosemi-transparente
        <div style={{ backgroundColor: 'rgba(91, 112, 131, 0.4)' }} className="fixed inset-0 flex items-start justify-center pt-10 z-50">
            <div className="bg-black text-white rounded-2xl w-full max-w-xl">
                {/* boton cerrar */}
                <div>
                    <input type="file" accept="image/*" className="hidden" />
                    <button onClick={handleCloseModal} className="cursor-pointer hover:bg-[#1e1e1e] rounded-full p-2 m-2">
                        <CloseIcon />
                    </button>
                </div>

                <FormPost isModal={true} />
            </div>
        </div>
    )
}

export default ComposePost;