import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductFrontend } from '../services/productService';

interface ProductCardProps {
  product: ProductFrontend;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const [imageLoading, setImageLoading] = useState(true);

  const formatPrice = (price: number | string) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));

  // List view
  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-48 object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </Link>
        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </Link>
          {product.dosageForm && (
            <div className="text-xs text-gray-500 mb-1">Dạng: {product.dosageForm}</div>
          )}
          {product.packaging && (
            <div className="text-xs text-gray-500 mb-1">Đóng gói: {product.packaging}</div>
          )}
          {(product.manufacturer || product.brand) && (
            <div className="text-xs text-gray-500 mb-1">
              NSX: {product.manufacturer || product.brand}
            </div>
          )}
          {product.expiryDate && (
            <div className="text-xs text-gray-500 mb-1">HSD: {product.expiryDate}</div>
          )}
          {product.country && (
            <div className="text-xs text-gray-500 mb-1">Quốc gia: {product.country}</div>
          )}
          <div className="mt-auto">
            {product.price && Number(product.price) > 0 ? (
              <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
            ) : (
              <span className="text-base font-semibold text-gray-500">Chưa có giá</span>
            )}
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-2"
            onClick={() => addToCart(product)}
            disabled={!product.price || Number(product.price) <= 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Thêm vào giỏ
          </button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-48 object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 line-clamp-2 mb-1">
          {product.name}
        </Link>
        {product.dosageForm && (
          <div className="text-xs text-gray-500 mb-1">Dạng: {product.dosageForm}</div>
        )}
        {product.packaging && (
          <div className="text-xs text-gray-500 mb-1">Đóng gói: {product.packaging}</div>
        )}
        {(product.manufacturer || product.brand) && (
          <div className="text-xs text-gray-500 mb-1">
            NSX: {product.manufacturer || product.brand}
          </div>
        )}
        {product.expiryDate && (
          <div className="text-xs text-gray-500 mb-1">HSD: {product.expiryDate}</div>
        )}
        {product.country && (
          <div className="text-xs text-gray-500 mb-1">Quốc gia: {product.country}</div>
        )}
        <div className="mt-auto">
          {product.price && Number(product.price) > 0 ? (
            <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
          ) : (
            <span className="text-base font-semibold text-gray-500">Chưa có giá</span>
          )}
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-2"
          onClick={() => addToCart(product)}
          disabled={!product.price || Number(product.price) <= 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;