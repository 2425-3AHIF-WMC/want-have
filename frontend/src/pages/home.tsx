import Hero from '../components/hero';
import React from 'react';
import "./home.css";
import TopInfoBar from "../components/top-info";
import Navbar from "../components/navbar";

const Home: React.FC = () => {
    return (
        <div className="homepage">
            <TopInfoBar />
            <Navbar />
            <Hero />
        </div>
    );
};

console.log("Homepage rendered");
export default Home;
