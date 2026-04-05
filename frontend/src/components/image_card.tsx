'use client';

import React, { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ImageCardProps {
  className?: string;
  style?: React.CSSProperties;
  // Photo URLs baked in at build time from R2
  images: string[];
}

const ImageCard: React.FC<ImageCardProps> = ({ className, style, images }) => {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    speed: 500,
    arrows: false,
    dots: false,
    fade: true,
    pauseOnHover: false,
    cssEase: 'linear',
  };

  if (images.length === 0) {
    return (
      <div
        className={`w-full flex items-center justify-center ${className ?? ''}`}
        style={{ aspectRatio: '1 / 1', background: 'hsl(var(--muted))', ...style }}
      >
        <span className="text-sm opacity-50">No photos available</span>
      </div>
    );
  }

  return (
    <div className={`w-full ${className ?? ''}`} style={style}>
      <Slider ref={sliderRef} {...settings}>
        {images.map((url, index) => (
          <div key={index}>
            {/* Force 1:1 square crop — uniform regardless of source dimensions */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
              <img
                src={url}
                alt={`MJW Jewellery ${index + 1}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageCard;
