// src/utils/dateHelpers.js
import { useLocation } from 'react-router-dom';

// Agregamos el parámetro isComment con un valor por defecto de false
export function formatPostTimestamp(isoString, pathname, isComment = false) { 
    const postDate = new Date(isoString);
    const now = new Date();

    const diffMs = now.getTime() - postDate.getTime();
    const oneSecondMs = 1000;
    const oneMinuteMs = 60 * oneSecondMs;
    const oneHourMs = 60 * oneMinuteMs;
    const oneDayMs = 24 * oneHourMs;

    const shouldUseShortFormat = pathname === '/home' || isComment;

    if (shouldUseShortFormat) {
        // Lógica para el formato corto (Xh, Xm, Xs, día mes [año])
        if (diffMs < oneDayMs) {
            const diffHours = Math.floor(diffMs / oneHourMs);
            if (diffHours > 0) {
                return `${diffHours}h`;
            }
            const diffMinutes = Math.floor(diffMs / oneMinuteMs);
            if (diffMinutes > 0) {
                return `${diffMinutes}m`;
            }
            const diffSeconds = Math.floor(diffMs / oneSecondMs);
            if (diffSeconds > 0) {
                return `${diffSeconds}s`;
            }
            return 'Ahora';
        } else {
            const options = { day: 'numeric', month: 'short' };
            if (postDate.getFullYear() !== now.getFullYear()) {
                options.year = 'numeric';
            }
            return new Intl.DateTimeFormat('es-ES', options).format(postDate);
        }
    } else {
        // Lógica para el formato largo (hora · día mes año)
        // Esto se ejecutará para el post principal en /post/status/:postId
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true, // Para 'a. m.' o 'p. m.'
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        };
        return new Intl.DateTimeFormat('es-ES', options).format(postDate);
    }
}