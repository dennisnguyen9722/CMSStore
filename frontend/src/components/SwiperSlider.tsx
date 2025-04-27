"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

interface SliderImage {
  image_path: string;
  link?: string;
}

interface Slider {
  id: number;
  title?: string;
  description?: string;
  images: SliderImage[];
}

export default function SwiperSlider() {
  const [sliders, setSliders] = useState<Slider[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sliders");
        const data = await res.json();
        setSliders(data);
      } catch (error) {
        console.error("Lỗi khi lấy slider:", error);
      }
    };

    fetchSliders();
  }, []);

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        slidesPerView={1}
      >
        {sliders.flatMap((slider) =>
          slider.images.map((img, index) => (
            <SwiperSlide key={`${slider.id}-${index}`}>
              <div className="w-full h-auto flex items-center justify-center rounded-xl">
                <img
                  src={`http://localhost:5000/uploads/sliders/${img.image_path}`}
                  alt={slider.title || `Slider ${slider.id}`}
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </SwiperSlide>
          ))
        )}
      </Swiper>
    </div>
  );
}
