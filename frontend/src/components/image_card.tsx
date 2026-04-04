import React, { useState, useEffect, useRef, useCallback } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ImageCardProps {
  className?: string;
  style?: React.CSSProperties;
}

// Only show images with a near-square or landscape aspect ratio (between 0.8 and 1.25).
// Everything else (tall portraits, panoramas) is excluded.
const ASPECT_MIN = 0.8;
const ASPECT_MAX = 1.25;

const getAspectRatio = (url: string): Promise<number | null> =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.width / img.height);
    img.onerror = () => resolve(null);
    img.src = url;
  });

const ImageCard: React.FC<ImageCardProps> = (props) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const cached = localStorage.getItem('mjw_photos');
        const cacheTimestamp = localStorage.getItem('mjw_photos_timestamp');
        const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

        if (cached && cacheTimestamp) {
          const isExpired = Date.now() - parseInt(cacheTimestamp) > CACHE_DURATION;
          if (!isExpired) {
            setImages(JSON.parse(cached));
            return;
          }
        }

        const apiUrl = process.env.NEXT_PUBLIC_INSTAGRAM_API_URL || '/api/photos';
        const response = await fetch(apiUrl);
        const data: string[] = await response.json();

        // Filter to only near-square / landscape images; force consistent crop via CSS.
        const qualified: string[] = [];
        for (const url of data) {
          const ratio = await getAspectRatio(url);
          if (ratio !== null && ratio >= ASPECT_MIN && ratio <= ASPECT_MAX) {
            qualified.push(url);
          }
        }

        setImages(qualified);
        localStorage.setItem('mjw_photos', JSON.stringify(qualified));
        localStorage.setItem('mjw_photos_timestamp', Date.now().toString());
      } catch (error) {
        console.error('Error fetching images:', error);
        const cached = localStorage.getItem('mjw_photos');
        if (cached) setImages(JSON.parse(cached));
      }
    };

    fetchImages();
  }, []);

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
    afterChange: (current: number) => setCurrentSlide(current),
  };

  return (
    <div className={`w-full ${props.className ?? ''}`} style={props.style}>
      {images.length > 0 ? (
        <Slider ref={sliderRef} {...settings}>
          {images.map((url, index) => (
            <div key={index}>
              {/* Force every image to a 1:1 square, centre-cropped */}
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
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{ aspectRatio: '1 / 1', background: 'hsl(var(--muted))' }}
        >
          <span className="text-sm opacity-50">Loading images…</span>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
