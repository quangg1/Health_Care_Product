import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Package, Calendar, MapPin } from 'lucide-react';
import { Product, useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  priceDisplay?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid', priceDisplay }) => {
  const { addToCart } = useCart();
  const [imageLoading, setImageLoading] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Memoized values for better performance
  const hasPrice = useMemo(() => product.price > 0, [product.price]);
  
  const formattedPrice = priceDisplay || formatPrice(product.price);

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=300';
    setImageLoading(false);
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          <div className="w-48 h-48 flex-shrink-0">
            <div className="relative w-full h-full">
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">Đang tải...</div>
                </div>
              )}
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2">
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  {product.prescription && (
                    <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded ml-2">
                      Cần đơn thuốc
                    </span>
                  )}
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-2 block"
                >
                  {product.name}
                </Link>
                <p className="text-gray-600 mb-3">{product.description}</p>
                
                {/* Drug-specific information */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                  {product.soDangKy && product.soDangKy.trim() && (
                    <div className="flex items-center">
                      <span className="font-medium">Số đăng ký:</span>
                      <span className="ml-1">{product.soDangKy}</span>
                    </div>
                  )}
                  {product.dangBaoChe && product.dangBaoChe.trim() && (
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      <span>{product.dangBaoChe}</span>
                    </div>
                  )}
                  {product.dongGoi && product.dongGoi.trim() && (
                    <div className="flex items-center">
                      <span className="font-medium">Đóng gói:</span>
                      <span className="ml-1">{product.dongGoi}</span>
                    </div>
                  )}
                  {product.hanSuDung && product.hanSuDung.trim() && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{product.hanSuDung}</span>
                    </div>
                  )}
                  {product.quocGia && product.quocGia.trim() && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{product.quocGia}</span>
                    </div>
                  )}
                  {product.manufacturer && product.manufacturer.trim() && (
                    <div className="flex items-center">
                      <span className="font-medium">NSX:</span>
                      <span className="ml-1">{product.manufacturer}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-6">
                <div className="mb-4">
                  {hasPrice ? (
                    <>
                      <span className="text-2xl font-bold text-blue-600">
                        {formattedPrice}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through ml-2 block">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="text-lg font-semibold text-gray-500">Chưa có giá</span>
                      <div className="text-sm text-gray-400 mt-1">Liên hệ để biết giá</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviews} đánh giá)
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {hasPrice ? (
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Thêm vào giỏ
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Chưa có giá
                    </button>
                  )}
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Đang tải...</div>
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-48 object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
            {product.category}
          </span>
          {product.prescription && (
            <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded ml-2">
              Cần đơn thuốc
            </span>
          )}
        </div>
        
        <Link
          to={`/product/${product.id}`}
          className="text-lg font-semibold text-gray-800 hover:text-blue-600 mb-2 block line-clamp-2"
        >
          {product.name}
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
        </div>
        
        <div className="mb-3">
          {hasPrice ? (
            <>
              <span className="text-xl font-bold text-blue-600">
                {formattedPrice}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </>
          ) : (
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-500">Chưa có giá</span>
              <div className="text-sm text-gray-400 mt-1">Liên hệ để biết giá</div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {hasPrice ? (
            <button
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Thêm vào giỏ
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Chưa có giá
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;