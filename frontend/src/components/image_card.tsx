import React, { useState, useEffect, useRef, useCallback } from 'react';
import Slider from 'react-slick';
import { Image } from "@nextui-org/image";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageCard: React.FC<{ className?: string }> = (props) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/instagram_photos');
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };
    fetchImages();

    const handleResize = () => {
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(sliderRef.current.innerSlider.state.currentSlide);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    centerMode: true,
    centerPadding: '0px',
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    speed: 500,
    arrows: false,
    dots: true,
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
    <div className={`w-full h-full ${props.className}`}>
      {images.length > 0 ? (
        <Slider ref={sliderRef} {...settings} className="h-full" customPaging={customPaging}>
          {images.map((image, index) => (
            <div key={index} className="h-full px-1 flex items-center justify-center">
              <div className="relative w-full h-full" style={getSlideStyle(index)}>
                <Image
                  isBlurred
                  alt={`MJW Jewellery ${index + 1}`}
                  src={image}
                  className="object-contain w-full h-full"
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