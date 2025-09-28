import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage - A modern image component with WebP support, lazy loading, and responsive sizing
 * 
 * Features:
 * - Automatic WebP/JPEG fallback
 * - Responsive image sizing with srcset
 * - Lazy loading with intersection observer
 * - Loading placeholder and error handling
 * - Automatic aspect ratio maintenance
 * - Progressive loading with blur effect
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio = '4/3',
  sizes = '(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px',
  lazy = true,
  priority = false,
  placeholder = 'blur',
  quality = 80,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef();
  const observerRef = useRef();

  // Generate responsive image URLs
  const generateImageUrls = (baseSrc) => {
    if (!baseSrc) return { webp: '', jpeg: '', srcset: '' };
    
    const basePath = baseSrc.replace(/\.[^/.]+$/, ''); // Remove extension
    const isExternal = baseSrc.startsWith('http') || baseSrc.startsWith('//');
    
    if (isExternal) {
      // For external images, return as-is
      return {
        webp: baseSrc,
        jpeg: baseSrc,
        srcset: baseSrc
      };
    }

    // Generate different sizes for responsive images
    const sizes = [400, 800, 1200];
    const webpSrcset = sizes.map(size => `${basePath}-${size}w.webp ${size}w`).join(', ');
    const jpegSrcset = sizes.map(size => `${basePath}-${size}w.jpg ${size}w`).join(', ');
    
    return {
      webp: `${basePath}.webp`,
      jpeg: `${basePath}.jpg`,
      webpSrcset,
      jpegSrcset,
      fallback: baseSrc
    };
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const imageUrls = generateImageUrls(src);
  const shouldShowImage = isInView || priority;

  // Generate CSS for aspect ratio
  const aspectRatioStyle = aspectRatio ? {
    aspectRatio: aspectRatio,
    width: width || '100%',
    height: height || 'auto'
  } : {
    width: width || 'auto',
    height: height || 'auto'
  };

  // CSS classes for loading states
  const imageClasses = [
    'optimized-image',
    className,
    isLoaded ? 'loaded' : 'loading',
    hasError ? 'error' : '',
    lazy && !isLoaded ? 'lazy' : ''
  ].filter(Boolean).join(' ');

  // Placeholder component
  const PlaceholderComponent = ({ className, style }) => {
    if (hasError) {
      return (
        <div 
          className={`${className} flex items-center justify-center bg-surface-tertiary text-text-secondary`}
          style={style}
        >
          <div className="text-center">
            <i className="fas fa-image text-2xl mb-2 opacity-50"></i>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      );
    }

    if (placeholder === 'blur') {
      return (
        <div 
          className={`${className} bg-gradient-to-br from-surface-secondary to-surface-tertiary animate-pulse`}
          style={style}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`${className} bg-surface-secondary`}
        style={style}
      />
    );
  };

  return (
    <div 
      ref={imgRef}
      className="relative overflow-hidden"
      style={aspectRatioStyle}
      {...props}
    >
      {/* Show placeholder while loading or if not in view */}
      {(!shouldShowImage || !isLoaded) && (
        <PlaceholderComponent 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
        />
      )}
      
      {/* Main image with WebP support */}
      {shouldShowImage && (
        <picture className="w-full h-full">
          {imageUrls.webpSrcset && (
            <source
              srcSet={imageUrls.webpSrcset}
              sizes={sizes}
              type="image/webp"
            />
          )}
          {imageUrls.jpegSrcset && (
            <source
              srcSet={imageUrls.jpegSrcset}
              sizes={sizes}
              type="image/jpeg"
            />
          )}
          <img
            src={imageUrls.fallback || src}
            alt={alt}
            className={imageClasses}
            style={{
              position: isLoaded ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: isLoaded ? 2 : 0,
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}

      {/* Loading overlay for smooth transitions */}
      {!isLoaded && shouldShowImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  aspectRatio: PropTypes.string,
  sizes: PropTypes.string,
  lazy: PropTypes.bool,
  priority: PropTypes.bool,
  placeholder: PropTypes.oneOf(['blur', 'empty']),
  quality: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default OptimizedImage;