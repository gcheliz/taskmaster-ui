import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoadingComplete?: () => void;
  sizes?: string;
  quality?: number;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoadingComplete,
  className,
  sizes,
  quality = 75,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    if (!width) return undefined;
    
    const widths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    const validWidths = widths.filter(w => w <= width * 2);
    
    return validWidths
      .map(w => {
        const url = getOptimizedUrl(src, w, quality);
        return `${url} ${w}w`;
      })
      .join(', ');
  };

  // Get optimized image URL (in production, this would use an image CDN)
  const getOptimizedUrl = (url: string, width: number, quality: number) => {
    // For production, integrate with image optimization service
    // Example: Cloudinary, Imgix, or custom image server
    if (process.env.NODE_ENV === 'production') {
      // return `https://your-cdn.com/optimize?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
    }
    return url;
  };

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadingComplete?.();
  };

  // Generate placeholder
  const getPlaceholder = () => {
    if (placeholder === 'empty') return undefined;
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple SVG placeholder
    const svgPlaceholder = `
      <svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svgPlaceholder)}`;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Placeholder */}
      {placeholder !== 'empty' && !isLoaded && (
        <img
          src={getPlaceholder()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          srcSet={generateSrcSet()}
          sizes={sizes || `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width || 800}px`}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};

// Picture component for art direction
export const OptimizedPicture = ({
  sources,
  src,
  alt,
  className,
}: {
  sources: Array<{
    srcSet: string;
    media?: string;
    type?: string;
  }>;
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <picture>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <OptimizedImage src={src} alt={alt} className={className} />
    </picture>
  );
};

// Hook for preloading critical images
export const useImagePreloader = (urls: string[]) => {
  useEffect(() => {
    const preloadImage = (url: string) => {
      const img = new Image();
      img.src = url;
    };

    urls.forEach(preloadImage);
  }, [urls]);
};