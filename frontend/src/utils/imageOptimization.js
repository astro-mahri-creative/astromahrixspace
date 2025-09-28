/**
 * Image Optimization Utilities
 * 
 * This module provides utilities for handling optimized images,
 * responsive sizing, format detection, and performance optimization.
 */

/**
 * Generate responsive image sizes based on a base image URL
 * @param {string} baseUrl - Base image URL
 * @param {Object} options - Optimization options
 * @returns {Object} Object containing various image URLs and srcsets
 */
export const generateResponsiveImages = (baseUrl, options = {}) => {
  const {
    sizes = [400, 800, 1200],
    formats = ['webp', 'jpg'],
    quality = 80
  } = options;

  if (!baseUrl) return null;

  // Check if it's an external URL
  const isExternal = baseUrl.startsWith('http') || baseUrl.startsWith('//');
  
  if (isExternal) {
    return {
      src: baseUrl,
      srcset: baseUrl,
      fallback: baseUrl
    };
  }

  // Extract file path without extension
  const pathWithoutExt = baseUrl.replace(/\.[^/.]+$/, '');
  const originalExt = baseUrl.match(/\.([^/.]+)$/)?.[1] || 'jpg';

  // Generate URLs for different sizes and formats
  const imageVariants = {};
  
  formats.forEach(format => {
    imageVariants[format] = {
      src: `${pathWithoutExt}.${format}`,
      srcset: sizes.map(size => 
        `${pathWithoutExt}-${size}w.${format} ${size}w`
      ).join(', ')
    };
  });

  return {
    ...imageVariants,
    fallback: baseUrl,
    originalFormat: originalExt
  };
};

/**
 * Get optimal image format based on browser support
 * @returns {string} Preferred image format
 */
export const getOptimalImageFormat = () => {
  if (typeof window === 'undefined') return 'jpg';
  
  // Check WebP support
  if (window.HTMLCanvasElement && 
      HTMLCanvasElement.prototype.toDataURL &&
      HTMLCanvasElement.prototype.toDataURL.call(document.createElement('canvas'), 'image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }
  
  // Check AVIF support (future-proofing)
  if (window.HTMLCanvasElement && 
      HTMLCanvasElement.prototype.toDataURL &&
      HTMLCanvasElement.prototype.toDataURL.call(document.createElement('canvas'), 'image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }
  
  return 'jpg';
};

/**
 * Calculate optimal image dimensions for a container
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {string} aspectRatio - Desired aspect ratio (e.g., '4/3', '16/9')
 * @returns {Object} Calculated dimensions
 */
export const calculateOptimalDimensions = (containerWidth, containerHeight, aspectRatio = '4/3') => {
  const [widthRatio, heightRatio] = aspectRatio.split('/').map(Number);
  const targetRatio = widthRatio / heightRatio;
  const containerRatio = containerWidth / containerHeight;

  let width, height;

  if (containerRatio > targetRatio) {
    // Container is wider than target ratio
    height = containerHeight;
    width = height * targetRatio;
  } else {
    // Container is taller than target ratio
    width = containerWidth;
    height = width / targetRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
    aspectRatio: targetRatio
  };
};

/**
 * Generate sizes attribute for responsive images
 * @param {Array} breakpoints - Array of breakpoint objects {width, size}
 * @returns {string} Sizes attribute string
 */
export const generateSizesAttribute = (breakpoints = []) => {
  if (breakpoints.length === 0) {
    return '(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px';
  }

  return breakpoints
    .map(({ width, size }, index) => {
      if (index === breakpoints.length - 1) {
        return size; // Last item doesn't need media query
      }
      return `(max-width: ${width}px) ${size}`;
    })
    .join(', ');
};

/**
 * Preload critical images for performance
 * @param {Array} imageSrcs - Array of image URLs to preload
 * @param {Object} options - Preload options
 */
export const preloadImages = (imageSrcs, options = {}) => {
  const { 
    as = 'image',
    type = 'image/webp',
    crossorigin = 'anonymous'
  } = options;

  imageSrcs.forEach(src => {
    if (typeof window !== 'undefined' && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = as;
      link.href = src;
      link.type = type;
      link.crossOrigin = crossorigin;
      document.head.appendChild(link);
    }
  });
};

/**
 * Get image metadata and dimensions
 * @param {string} imageUrl - Image URL
 * @returns {Promise<Object>} Promise resolving to image metadata
 */
export const getImageMetadata = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        src: imageUrl
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Lazy load images with intersection observer
 * @param {string} selector - CSS selector for images to lazy load
 * @param {Object} options - Intersection observer options
 */
export const initLazyLoading = (selector = '[data-src]', options = {}) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const {
    rootMargin = '50px',
    threshold = 0.1
  } = options;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      }
    });
  }, { rootMargin, threshold });

  document.querySelectorAll(selector).forEach(img => {
    observer.observe(img);
  });

  return observer;
};

/**
 * Convert image to different formats client-side (for uploads)
 * @param {File} file - Image file
 * @param {string} format - Target format ('webp', 'jpeg', 'png')
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<Blob>} Promise resolving to converted image blob
 */
export const convertImageFormat = (file, format = 'webp', quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image'));
        }
      }, `image/${format}`, quality);
    };

    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Default image optimization presets for different use cases
 */
export const imagePresets = {
  hero: {
    sizes: [768, 1024, 1536, 1920],
    formats: ['webp', 'jpg'],
    quality: 85,
    aspectRatio: '16/9'
  },
  product: {
    sizes: [300, 600, 900, 1200],
    formats: ['webp', 'jpg'],
    quality: 80,
    aspectRatio: '4/3'
  },
  thumbnail: {
    sizes: [150, 300, 450],
    formats: ['webp', 'jpg'],
    quality: 75,
    aspectRatio: '1/1'
  },
  avatar: {
    sizes: [100, 200, 400],
    formats: ['webp', 'png'],
    quality: 85,
    aspectRatio: '1/1'
  }
};

/**
 * Performance monitoring for images
 */
export const trackImagePerformance = (imageSrc, startTime) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Image loaded: ${imageSrc} (${loadTime.toFixed(2)}ms)`);
    }
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'image_load', {
        custom_parameter: imageSrc,
        value: Math.round(loadTime)
      });
    }
  }
};