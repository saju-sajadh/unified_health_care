import Image from 'next/image';


const Hero = () => {

    return (
        <section id="home-section" className='bg-slateGray'>
            <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 pt-20">
                <div className='grid grid-cols-1 lg:grid-cols-12 space-x-1 items-center'>
                    <div className='col-span-6 flex flex-col gap-8 '>                      
                        <h1 className='text-midnight_text text-4xl sm:text-5xl font-semibold pt-5 lg:pt-0'>Transform healthcare with secure patient tracking System.</h1>
                        <h3 className='text-black/70 text-lg pt-5 lg:pt-0'>Empower healthcare innovation with cutting-edge patient tracking technology.</h3>
                        <div className='flex flex-col lg:grid grid-cols-3 items-start lg:items-center justify-between lg:pt-4'>
                            <div className='flex gap-2'>
                                <Image src={`/images/banner/check-circle.svg`} alt="check-image" width={30} height={30} className='smallImage' />
                                <p className='text-sm sm:text-lg font-normal text-black'>Adaptable</p>
                            </div>
                            <div className='flex gap-2'>
                                <Image src={`/images/banner/check-circle.svg`} alt="check-image" width={30} height={30} className='smallImage' />
                                <p className='text-sm sm:text-lg font-normal text-black'> intuitive</p>
                            </div>
                            <div className='flex gap-2'>
                                <Image src={`/images/banner/check-circle.svg`} alt="check-image" width={30} height={30} className='smallImage' />
                                <p className='text-sm sm:text-lg font-normal text-black'>collaborative</p>
                            </div>
                        </div>

                    </div>
                    <div className='col-span-6 flex justify-center'>
                        <Image src={`/images/banner/mahila.png`} alt="nothing" width={1000} height={805} />
                    </div>
                </div>

            </div>
        </section >
    )
}

export default Hero;
