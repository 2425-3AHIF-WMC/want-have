import Hero from '../components/hero';
import CategoryCard from '../components/category-card';
import React from 'react';

const categories = ['Electronics', 'Clothing', 'Furniture', 'Vehicles', 'Books', 'Appliances'];

const Home: React.FC = () => {
    return (
        <div className="p-4">
            <Hero />
            <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {categories.map((cat, idx) => (
                    <CategoryCard key={idx} name={cat} />
                ))}
            </div>
        </div>
    );
};

export default Home;
