import React, { useState } from "react";
import "./hero.css";

interface HeroProduct {
    title: string;
    subtitle: string;
    description: string;
    image: string;
}

const products: HeroProduct[] = [
    {
        title: "Repr in voluptate",
        subtitle: "Ullamco laboris nisi ut",
        description:
            "We bring you 100% free CSS templates for your websites. If you wish to support TemplateMo...",
        image: "../img/product.png",
    },
    {
        title: "Next Level Comfort",
        subtitle: "New arrivals are here",
        description: "Check out our latest product range – elegant, modern and stylish.",
        image: "../img/product.png",
    },
    {
        title: "Minimal Style",
        subtitle: "Pure design focus",
        description: "Designed for calm, comfort and function. Discover our minimalist collection.",
        image: "../img/product.png",
    },
];

const Hero: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const total = products.length;

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    };

    const current = products[currentIndex];

    return (
        <section className="hero-section">
            <button className="arrow left" onClick={prevSlide}>
                &#10094;
            </button>

            <div className="hero-content">
                <div className="hero-text">
                    <h1>{current.title}</h1>
                    <h2>{current.subtitle}</h2>
                    <p>{current.description}</p>
                </div>
                <div className="hero-image">
                    <img src={current.image} alt={current.title} />
                </div>
            </div>

            <button className="arrow right" onClick={nextSlide}>
                &#10095;
            </button>
        </section>
    );
};

export default Hero;
