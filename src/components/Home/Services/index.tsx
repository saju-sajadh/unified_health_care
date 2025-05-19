"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { services } from "@/utils/data";

const Courses = () => {

    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 2,
        arrows: false,
        autoplay: true,
        speed: 500,
        cssEase: "linear",
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            }
        ]
    };



    return (
        <section id="courses">
            <div className='container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4'>
                <div className="sm:flex justify-between items-center mb-20">
                    <h2 className="text-midnight_text text-4xl lg:text-5xl font-semibold mb-5 sm:mb-0">Our Services.</h2>
                </div>
                <Slider {...settings}>
                    {services.map((item, i) => (
                        <div key={i}>
                            <div className='bg-white m-3 mb-12 px-3 pt-3 pb-12 shadow-course-shadow rounded-2xl h-full'>
                                <div className="relative rounded-3xl">
                                    <Image src={item.imgSrc} alt="course-image" width={380} height={260} className="m-auto clipPath rounded-xl" />  
                                </div>

                                <div className="px-3 pt-6">
                                    <Link href="#" className='text-2xl font-normal text-black max-w-75% inline-block'>{item.heading}</Link>
                                
                                    
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
}

export default Courses;
