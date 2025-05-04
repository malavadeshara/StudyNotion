import React from "react";
import CTAButton from "../HomePage/Button";
import HighlightText from "./HighlightText";
import { FaArrowRight } from "react-icons/fa6";
import { TypeAnimation } from 'react-type-animation';

const CodeBlocks = ({
    position, heading, subHeading, ctaButton1, ctaButton2, codeBlock, bgGradient, codeColor
}) => {
    return (
        <div className={`flex ${position} my-20 justify-between gap-10`}>

            {/* Section-1 */}
            <div className="w-[50%] flex flex-col gap-8">
                {heading}
                <div className="text-richblack-300 font-bold">
                    {subHeading}
                </div>

                <div className="flex mt-7 gap-7">
                    <CTAButton active={ctaButton1.active} linkTo={ctaButton1.linkTo}>
                        <div className="flex gap-2 items-center">
                            {ctaButton1.text}
                            <FaArrowRight />
                        </div>
                    </CTAButton>

                    <CTAButton active={ctaButton2.active} linkTo={ctaButton2.linkTo}>
                            {ctaButton1.text} 
                    </CTAButton>
                </div>
            </div>

            {/* Section-2 */}
            <div className="h-fit code-border flex flex-row py-3 text-[10px] sm:text-sm leading-[18px] sm:leading-6 relative w-[100%] lg:w-[470px]">
                {/* HW :-> Background Gradient */}
                {bgGradient}
                <div className="text-center flex flex-col   w-[10%] select-none text-richblack-400 font-inter font-bold">
                    <p>1</p>
                    <p>2</p>
                    <p>3</p>
                    <p>4</p>
                    <p>5</p>
                    <p>6</p>
                    <p>7</p>
                    <p>8</p>
                    <p>9</p>
                    <p>10</p>
                    <p>11</p>
                </div>

                <div className={`w-[90%] flex flex-col gap-2 font-bold font-mono ${codeColor} pr-1`}>
                    <TypeAnimation 
                        sequence={[codeBlock, 1000, ""]}
                        repeat={Infinity}
                        cursor={true}
                        style={
                            {
                                whiteSpace: "pre-line",
                                display: "block",
                            }
                        }
                        omitDeletionAnimation={true}
                    />
                </div>
            </div>
        </div>
    )
}

export default CodeBlocks;