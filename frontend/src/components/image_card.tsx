import React, { useState, useEffect, useRef, useCallback } from 'react';
import Slider from 'react-slick';
import { Image } from "@nextui-org/image";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ImageCardProps {
  className?: string;
  style?: React.CSSProperties; 
}


const ImageCard: React.FC<ImageCardProps> = (props) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<Slider>(null);
  const [slidesToShow, setSlidesToShow] = useState(3);


  const isTallImage = (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image(); // Use native Image constructor
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        console.log(aspectRatio)
        resolve(aspectRatio < 1.0);
      };
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  };
  
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Check if we have cached data
        
        const cached = localStorage.getItem('instagram_photos');
        const cacheTimestamp = localStorage.getItem('instagram_photos_timestamp');
        const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

        // Use cached data if it exists and is not expired
        if (cached && cacheTimestamp) {
          console.log("using cached data")
          const isExpired = Date.now() - parseInt(cacheTimestamp) > CACHE_DURATION;
          if (!isExpired) {
            setImages(JSON.parse(cached));
            return;
          }
        }

        // Fetch new data if cache is missing or expired
        const response = await fetch('/api/instagram_photos');
        const data = await response.json();
        

        const filteredImages = [];
        for (const imageUrl of data) {
          const isTall = await isTallImage(imageUrl);
          if (!isTall) {
            filteredImages.push(imageUrl);
          }
        }
        // Update state and cache
        setImages(filteredImages);
        localStorage.setItem('instagram_photos', JSON.stringify(data));
        localStorage.setItem('instagram_photos_timestamp', Date.now().toString());
      } catch (error) {
        console.error('Error fetching images:', error);
        // If fetch fails, try to use cached data as fallback
        const cached = localStorage.getItem('instagram_photos');
        if (cached) {
          setImages(JSON.parse(cached));
        }
      }
    };
    fetchImages();

    const handleResize = () => {
      const width = window.innerWidth;
      const newSlidesToShow = width >= 1180 ? 3 : width >= 768 ? 2 : 1;
      setSlidesToShow(newSlidesToShow);

      if (sliderRef.current && sliderRef.current.slickGoTo) {
        sliderRef.current.slickGoTo(currentSlide);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [currentSlide]);

  const settings = {
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    vertical: false,
    speed: 500,
    arrows: false,
    dots: false,
    fade:true,
    pauseOnHover: false,
    cssEase: "linear",
    afterChange: (current: number) => setCurrentSlide(current),
  };

  const customPaging = useCallback(() => {
    return (
      <div className="w-2 h-2 mx-1 rounded-full bg-gray-300 hover:bg-gray-400" />
    );
  }, []);

  

  const getSlideStyle = (index: number) => {
    const isActive = index === currentSlide;
    return {
      transform: isActive ? 'scale(1)' : 'scale(0.9)',
      filter: isActive ? 'brightness(100%)' : 'brightness(70%)',
      transition: isActive ? 'all 0.3s ease-in-out' : 'all 0.3s ease-in-out'
    };
  };

  return (
    <div className={`w-full h-full ${props.className}`} style={props.style}>
      {images.length > 0 ? (
        <Slider ref={sliderRef} {...settings} className="h-full" customPaging={customPaging}>
          {images.map((image, index) => (
            <div key={index} className="h-full flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <Image
                  alt={`MJW Jewellery ${index + 1}`}
                  src={image}
                  className="object-cover w-full h-full"
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                />
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <span>Loading images...</span>
        </div>
      )}
    </div>
  );
};

export default ImageCard;