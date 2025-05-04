import React from "react";

const BackgroundPattern = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
        </div>
    );
};

// Floating particles animation component
const FloatingParticles = () => {
    return (
        <div className="absolute p-float inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => {
                const size = Math.floor(Math.random() * 8) + 4;
                const top = `${Math.random() * 100}%`;
                const left = `${Math.random() * 100}%`;
                const animationDuration = `${Math.random() * 20 + 10}s`;
                const delay = `${Math.random() * 5}s`;
                const opacity = Math.random() * 0.07 + 0.03;

                return (
                    <div
                        key={i}
                        className="absolute bg-blue-900 rounded-full"
                        style={{
                            width: size,
                            height: size,
                            top,
                            left,
                            opacity,
                            animation: `float ${animationDuration} infinite ease-in-out`,
                            animationDelay: delay,
                        }}
                    />
                );
            })}
        </div>
    );
};
export default function AuthLayout(
    {children}: {
        children: React.ReactNode
    }
) {


    return (
        <div className="relative w-full min-h-screen bg-gray-100 flex items-center justify-center md:pdy-4">
            <BackgroundPattern/>
            <FloatingParticles/>

            <div
                className="w-full h-full min-h-screen md:min-h-auto max-w-4xl bg-white text-dark p-6 md:rounded-[2.15rem] md:shadow-xl relative overflow-hidden z-10 border border-gray-100">
                <div className="grid md:min-h-[20rem] grid-cols-1 sm:grid-cols-2 gap-y-10 relative">
                    {children}
                </div>
            </div>
        </div>
    )
}