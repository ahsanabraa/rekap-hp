import { useEffect } from 'react';

export default function useHashScroll() {
    useEffect(() => {
        const scrollToHash = () => {
            const id = window.location.hash.replace('#', '');
            if (!id) return;

            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        const timer = window.setTimeout(scrollToHash, 80);
        window.addEventListener('hashchange', scrollToHash);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('hashchange', scrollToHash);
        };
    }, []);
}
