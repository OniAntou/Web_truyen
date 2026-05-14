import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * LazyImage Component
 * Uses Intersection Observer to only load images when they are close to the viewport.
 * Prevents layout shift by using an aspect ratio container or filling parent space.
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} className - Classes to apply (used for detecting fill mode and applied to img)
 * @param {object} style - Inline styles
 * @param {number} aspectRatio - Width / Height placeholder (default 0.7 for comic covers/pages)
 * @param {boolean} releaseAspectRatioOnLoad - Keep placeholder ratio before load, then size to the image naturally
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: number;
    releaseAspectRatioOnLoad?: boolean;
    fill?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = '',
    style,
    aspectRatio = 0.7,
    releaseAspectRatioOnLoad = false,
    fill = false,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fill mode means the image should occupy its container completely
    const isFillMode = fill;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (containerRef.current) {
                        observer.unobserve(containerRef.current);
                    }
                }
            },
            {
                rootMargin: '800px 0px',
                threshold: 0.01
            }
        );

        const currentRef = containerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    const shouldReserveAspectRatio = !isFillMode && aspectRatio && !(releaseAspectRatioOnLoad && isLoaded);

    const containerStyle: React.CSSProperties = isFillMode
        ? { overflow: 'hidden', ...style }
        : {
            width: '100%',
            ...(shouldReserveAspectRatio ? { aspectRatio: `${aspectRatio}`, overflow: 'hidden' } : {}),
            display: 'block',
            ...style
        };

    const containerClasses = isFillMode
        ? 'lazy-image-container lazy-image-fill'
        : 'lazy-image-container relative';

    return (
        <div 
            ref={containerRef}
            className={containerClasses}
            style={containerStyle}
        >
            {(!isVisible || !isLoaded) && !error && (
                <div className="lazy-image-skeleton" />
            )}
            
            {error ? (
                <div className="lazy-image-error">
                    <AlertCircle size={24} className="opacity-40" />
                    <span className="text-[10px] uppercase tracking-wider opacity-40">Lỗi tải ảnh</span>
                </div>
            ) : (
                isVisible && (
                    <img
                        src={src}
                        alt={alt || ''}
                        className={`lazy-img ${isLoaded ? 'lazy-img-loaded' : ''} ${className}`}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setError(true)}
                        {...props}
                    />
                )
            )}
        </div>
    );
};

export default LazyImage;
