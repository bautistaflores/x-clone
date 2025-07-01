import React from 'react';

// Este componente RetweetIcon ahora acepta las props que necesitas
// Puedes desestructurar directamente las props que se le pasarán
function RetweetIcon({ isRetweeted, width = 20, height = 20 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 21 21"><g fill='none' fillRule="evenodd" stroke={'currentColor'} strokeWidth={isRetweeted ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round" transform="translate(1 4)"> 
            <path d="m12.5 9.5 3 3 3-3"></path> <path d="m8.5.5h3c2.209139 0 4 1.790861 4 4v8"></path> <path d="m6.5 3.5-3-3-3 3"></path> <path d="m10.5 12.5h-3c-2.209139 0-4-1.790861-4-4v-8"></path> </g>
        </svg>
    );
}

export default RetweetIcon;