import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, MapPin, Phone, User, Calendar, Clock } from 'lucide-react';

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.userName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    district: '',
    ward: ''
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prescriptionImages, setPrescriptionImages] = useState<File[]>([]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Thanh toán khi nhận hàng',
      icon: <Truck className="h-5 w-5" />,
      description: 'Thanh toán bằng tiền mặt khi nhận hàng'
    },
    {
      id: 'credit_card',
      name: 'Thẻ tín dụng/ghi nợ',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Thanh toán bằng thẻ Visa, Mastercard'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: <div className="w-5 h-5 bg-pink-500 rounded"></div>,
      description: 'Thanh toán qua ví MoMo'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: <div className="w-5 h-5 bg-blue-500 rounded"></div>,
      description: 'Thanh toán qua ZaloPay'
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      icon: <div className="w-5 h-5 bg-orange-500 rounded"></div>,
      description: 'Thanh toán qua ShopeePay'
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      icon: <div className="w-5 h-5 bg-green-500 rounded"></div>,
      description: 'Chuyển khoản trực tiếp'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const shippingCost = getTotalPrice() > 500000 ? 0 : 30000;
  const totalAmount = getTotalPrice() + shippingCost;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPrescriptionImages(prev => [...prev, ...files]);
    }
  };

  const removePrescriptionImage = (index: number) => {
    setPrescriptionImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng');
      return;
    }

    if (cart.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          prescription: item.prescription
        })),
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
        notes,
        prescriptionImages: prescriptionImages.map(file => file.name) // In real app, upload to cloud storage
      };

      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        alert('Đặt hàng thành công!');
        clearCart();
        navigate('/account');
      } else {
        alert('Có lỗi xảy ra: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Details */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Thông tin giao hàng
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ *
                </label>
                <textarea
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.ward}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, ward: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <div className="mr-3">{method.icon}</div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Prescription Upload */}
          {cart.some(item => item.prescription) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Đơn thuốc (nếu có)</h2>
              
              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                
                {prescriptionImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Files đã chọn:</p>
                    {prescriptionImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removePrescriptionImage(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Ghi chú</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
            
            {/* Order Items */}
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{shippingCost === 0 ? 'Miễn phí' : formatPrice(shippingCost)}</span>
              </div>
              
              {shippingCost > 0 && (
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  Thêm {formatPrice(500000 - getTotalPrice())} để được miễn phí vận chuyển!
                </div>
              )}
              
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
            
            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Thanh toán an toàn với SSL</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Hoàn tiền trong 30 ngày</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage; 