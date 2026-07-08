import React from 'react';

interface CartIconProps {
    className?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M5.4 5h15l-1.5 9h-11.5L5.4 5z" />
        <circle cx="9" cy="18" r="1.5" stroke="currentColor" strokeWidth={2} />
        <circle cx="17" cy="18" r="1.5" stroke="currentColor" strokeWidth={2} />
    </svg>
);

export default CartIcon;
