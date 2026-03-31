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
const LazyImage = ({
    src,
    alt,
    className = '',
    style,
    aspectRatio = 0.7,
    releaseAspectRatioOnLoad = false,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const containerRef = useRef(null);

    // Detect if this image is meant to fill its parent absolutely or completely
    const isAbsoluteFill = className.includes('absolute') && className.includes('inset-0');
    const isFullHeight = className.includes('h-full') || className.includes('h-[');
    const isFullWidth = className.includes('w-full') || className.includes('w-[');
    const isFillMode = isAbsoluteFill || (isFullHeight && isFullWidth);

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

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    const shouldReserveAspectRatio = !isFillMode && aspectRatio && !(releaseAspectRatioOnLoad && isLoaded);

    // Container style:
    // - Fill mode: No extra styles needed, CSS class handles it
    // - Normal mode: Keep aspect-ratio to prevent layout shift until the image loads
    // - Natural mode: Release the placeholder ratio after load so tall comic pages keep their real height
    const containerStyle = isFillMode
        ? { overflow: 'hidden', ...style }
        : {
            width: '100%',
            ...(shouldReserveAspectRatio ? { aspectRatio: `${aspectRatio}`, overflow: 'hidden' } : {}),
            display: 'block',
            ...style
        };

    // Container classes:
    // - lazy-image-fill sets absolute over parent
    const containerClasses = isFillMode
        ? 'lazy-image-container lazy-image-fill'
        : 'lazy-image-container relative';

    return (
        <div 
            ref={containerRef}
            className={containerClasses}
            style={containerStyle}
        >
            {/* Show skeleton while not loaded or not in viewport */}
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
                        // Image receives all classes passed to it
                        // (including tailwind sizing, object-fit, custom classes like info-cover-img)
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
