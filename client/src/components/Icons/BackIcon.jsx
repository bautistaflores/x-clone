import React from 'react';

function BackIcon({ height = 20, width = 20 }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" height={height} width={width} fill="#fff"><g>
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g>
        </svg>
    )
}

export default BackIcon;