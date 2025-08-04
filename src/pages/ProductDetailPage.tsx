import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Plus, Minus, Heart, Share2, ArrowLeft, Shield, Truck, Clock, Package, Calendar, MapPin, FileText, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { drugService } from '../services/drugService';
import { Product } from '../context/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=300';
    setImageLoading(false);
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await drugService.getDrugById(id);
        const transformedProduct = drugService.transformDrugToProduct(response.data);
        setProduct(transformedProduct);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải thông tin sản phẩm...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Không tìm thấy sản phẩm'}
          </h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-700">
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatPriceFromGiaThuoc = () => {
    if (product.giaThuoc && product.giaThuoc.length > 0) {
      const latestPrice = product.giaThuoc[product.giaThuoc.length - 1];
      if (latestPrice && latestPrice.giaKeKhai) {
        return product.packaging ? `${latestPrice.giaKeKhai} VND (${product.packaging})` : `${latestPrice.giaKeKhai} VND`;
      }
    }
    return formatPrice(product.price);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Đang tải...</div>
              </div>
            )}
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-96 object-cover rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                {product.category}
              </span>
              {product.prescription && (
                <span className="text-sm text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded">
                  Cần đơn thuốc
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">({product.reviews} đánh giá)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.price > 0 ? (
              <>
                <span className="text-3xl font-bold text-blue-600">
                  {formatPriceFromGiaThuoc()}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through ml-2">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </>
            ) : (
              <div className="text-center">
                <span className="text-2xl font-semibold text-gray-500">Chưa có giá</span>
                <div className="text-sm text-gray-400 mt-1">Liên hệ để biết giá</div>
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex space-x-4">
            {product.price > 0 ? (
              <>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Thêm vào giỏ hàng
                </button>
              </>
            ) : (
              <button
                disabled
                className="flex-1 bg-gray-400 text-white py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Chưa có giá
              </button>
            )}
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t border-gray-200">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-sm">Được cấp phép</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-sm">Giao hàng nhanh</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-orange-600 mr-2" />
              <span className="text-sm">Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'description'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mô tả
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ingredients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thành phần
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Hướng dẫn sử dụng
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin thuốc
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pricing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch sử giá
            </button>
          </nav>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Thành phần</h3>
              <p className="text-gray-600">{product.ingredients || 'Không có thông tin thành phần'}</p>
            </div>
          )}

          {activeTab === 'usage' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng</h3>
              {product.dosage && product.dosage.startsWith('http') ? (
                <div>
                  <p className="text-gray-600 mb-4">Xem hướng dẫn chi tiết:</p>
                  <iframe
                    src={product.dosage}
                    className="w-full h-96 border border-gray-300 rounded-lg"
                    title="Hướng dẫn sử dụng"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-600">{product.dosage || 'Không có hướng dẫn sử dụng'}</p>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin thuốc</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.soDangKy && product.soDangKy.trim() && (
                  <div>
                    <span className="font-medium">Số đăng ký:</span>
                    <span className="ml-2">{product.soDangKy}</span>
                  </div>
                )}
                {product.dangBaoChe && product.dangBaoChe.trim() && (
                  <div>
                    <span className="font-medium">Dạng bào chế:</span>
                    <span className="ml-2">{product.dangBaoChe}</span>
                  </div>
                )}
                {product.dongGoi && product.dongGoi.trim() && (
                  <div>
                    <span className="font-medium">Đóng gói:</span>
                    <span className="ml-2">{product.dongGoi}</span>
                  </div>
                )}
                {product.hanSuDung && product.hanSuDung.trim() && (
                  <div>
                    <span className="font-medium">Hạn sử dụng:</span>
                    <span className="ml-2">{product.hanSuDung}</span>
                  </div>
                )}
                {product.quocGia && product.quocGia.trim() && (
                  <div>
                    <span className="font-medium">Quốc gia:</span>
                    <span className="ml-2">{product.quocGia}</span>
                  </div>
                )}
                {product.manufacturer && product.manufacturer.trim() && (
                  <div>
                    <span className="font-medium">Nhà sản xuất:</span>
                    <span className="ml-2">{product.manufacturer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Lịch sử giá</h3>
              {product.giaThuoc && product.giaThuoc.length > 0 ? (
                <div className="space-y-3">
                  {product.giaThuoc.map((gia, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Giá: {gia.giaKeKhai} {gia.donViTinh || ''}</span>
                          <div className="text-sm text-gray-600">
                            Đóng gói: {gia.dongGoi || 'Không có thông tin'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {gia.ngayKeKhai || 'Chưa có ngày'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Chưa có thông tin giá</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;