import React from 'react';

function CloseIcon({ height = 20, width = 20, color = "#fff"}) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" height={height} width={width} fill={color}><g>
            <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g>
        </svg>
    )
}

export default CloseIcon;