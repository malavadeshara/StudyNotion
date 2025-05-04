import React from 'react'
import { FaArrowRight } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from "../components/core/HomePage/Button";
import BannerVideo from "../assets/Images/banner.mp4"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import TimeLineSection from "../components/core/HomePage/TimeLineSection";
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";

const Home = () => {
    return (
        <div>
            {/* Section-1 */}
            <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white gap-10 justify-between'>
                <Link to={"/signup"}>
                    <div className='group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit'>
                        <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900'>
                            <p>Become an Instructor</p>
                            <FaArrowRight />
                        </div>
                    </div>
                </Link>

                <div className='text-center text-4xl font-semibold mt-7'>
                    Empower Your Future With
                    <HighlightText text={"Coding Skills"} />
                </div>

                <div className='mt-4 w-[90%] text-center text-lg font-bol text-richblack-300'>
                    With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on projects, quizzes, and personalized feedback from instructor.
                </div>

                <div className='flex flex-row gap-7 mt-8'>
                    <CTAButton active={true} linkTo={"/signup"}>
                        Learn More
                    </CTAButton>

                    <CTAButton active={false} linkTo={"/login"}>
                        Book a Demo
                    </CTAButton>
                </div>

                <div className='mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200'>
                    <video muted loop autoPlay className="shadow-[20px_20px_rgba(255,255,255)]">
                        <source src={BannerVideo} type="video/mp4" />
                    </video>
                </div>

                {/* Code Section - 1 */}
                <div>
                    <CodeBlocks
                        position={"lg:flex-row"}
                        heading={
                            <div className='text-4xl font-semibold'>
                                Unlock Your
                                <HighlightText text={"Coding Potential"} />
                                With Our Online Courses
                            </div>
                        }
                        subHeading={
                            'Our courses are designed and taught by industry experts who have years of experience in coding and passionate about sharing their knowledge with you.'
                        }
                        ctaButton1={
                            {
                                text: "Try it yourself",
                                linkTo: "/signup",
                                active: true,
                            }
                        }
                        ctaButton2={
                            {
                                text: "Learn more",
                                linkTo: "/login",
                                active: false,
                            }
                        }
                        codeBlock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
                        codeColor={"text-yellow-25"}
                        bgGradient={<div className="codeblock1 absolute"></div>}
                    />
                </div>

                {/* Code Section 2 */}
                <div>
                    <CodeBlocks
                        position={"lg:flex-row-reverse"}
                        heading={
                            <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                                Start
                                <HighlightText text={"coding in seconds"} />
                            </div>
                        }
                        subHeading={
                            "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
                        }
                        ctaButton1={{
                            text: "Continue Lesson",
                            linkTo: "/signup",
                            active: true,
                        }}
                        ctaButton2={{
                            text: "Learn More",
                            linkTo: "/signup",
                            active: false,
                        }}
                        codeColor={"text-white"}
                        codeBlock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
                        bgGradient={<div className="codeblock2 absolute"></div>}
                    />
                </div>
            </div>

            {/* Section-2 */}
            <div className='bg-pure-greys-5 text-richblack-700'>
                <div className='homepage_bg h-[310px]'>
                    <div className='w-11/12 max-w-maxContent flex flex-col items-center gap-5 mx-auto'>
                        <div className='h-[75px]'></div>
                        <div className='flex flex-row gap-7 text-white'>
                            <CTAButton active={true} linkTo={("/signup")}>
                                <div className='flex items-center gap-3'>
                                    Explore Full Catalog
                                    <FaArrowRight />
                                </div>
                            </CTAButton>

                            <CTAButton active={false} linkTo={"/signup"}>
                                <div>
                                    Learn More
                                </div>
                            </CTAButton>
                        </div>
                    </div>
                </div>

                <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>
                    <div className='flex flex-row gap-5 mb-10 mt-[90px]'>
                        <div className='text-4xl font-semibold w-[45%]'>
                            Get the skills you need for a
                            <HighlightText text={"job that is in demand"} />
                        </div>

                        <div className='flex flex-col gap-10 w-[40%] items-start'>
                            <div className='text-[16px]'>
                                The modern StudyNotion is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                            </div>

                            <CTAButton active={true} linkTo={"/signup"}>
                                <div>
                                    Learn more
                                </div>
                            </CTAButton>
                        </div>
                    </div>
                </div>

                <TimeLineSection />

                <LearningLanguageSection />
            </div>
        </div>
    );
}

export default Home;