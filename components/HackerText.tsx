import React, { useState, useEffect, useRef } from 'react';

interface HackerTextProps {
    text: string;
    className?: string;
    revealSpeed?: number; // ms to reveal one character
}

const HackerText: React.FC<HackerTextProps> = ({ text, className, revealSpeed = 300 }) => {
    const [displayText, setDisplayText] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&*<>^";
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        let iteration = 0;
        const intervalSpeed = 30; // 30ms = ~33fps for smooth scrambling
        const increment = intervalSpeed / revealSpeed; // Calculate how much to advance per tick

        // Start with random characters immediately
        setDisplayText(text.split("").map(() => chars[Math.floor(Math.random() * chars.length)]).join(""));

        intervalRef.current = window.setInterval(() => {
            setDisplayText(prev =>
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setDisplayText(text); // Ensure final text is exact
            }

            iteration += increment;
        }, intervalSpeed);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text, revealSpeed]);

    return <span className={className}>{displayText}</span>;
};

export default HackerText;
