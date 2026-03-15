import React, { useState } from 'react';

const LazyImage = ({ src, alt, className, style, ...props }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <img
            src={src}
            alt={alt || ''}
            className={`${className || ''} lazy-img ${loaded ? 'lazy-img-loaded' : ''}`}
            style={style}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            {...props}
        />
    );
};

export default LazyImage;
