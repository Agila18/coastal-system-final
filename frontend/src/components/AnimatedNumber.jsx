import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedNumber = ({ value, duration = 2, className = "" }) => {
    const springValue = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    });

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(Math.round(latest));
        });
    }, [springValue]);

    return (
        <motion.span className={className}>
            {displayValue}
        </motion.span>
    );
};

export default AnimatedNumber;
