import React from "react";

interface Props {
    name: string;
    icon?: string;
}

const CategoryCard: React.FC<Props> = ({ name }) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md text-center transition cursor-pointer">
        <div className="text-3xl mb-2">📦</div>
        <h2 className="text-lg font-semibold">{name}</h2>
    </div>
);

export default CategoryCard;
