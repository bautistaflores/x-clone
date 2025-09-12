import React from 'react';

function LoadingIcon({ className }) {
    return (
        <div className="flex justify-center h-full py-5">
            <svg
                className={className + "w-10 h-10 animate-[spin_1s_linear_infinite]"}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 32 32"
            >
                {/* circulo de fondo */}
                <circle
                    className="opacity-25"
                    cx="16"
                    cy="16"
                    r="14"
                    strokeWidth="4"
                    style={{ stroke: 'rgb(29, 155, 240)'}}
                ></circle>
                {/* circulo de adelante */}
                <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="#2196F3"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{ strokeDasharray: '20 80' }}
                ></circle>
            </svg>
        </div>
    );
}

export default LoadingIcon;