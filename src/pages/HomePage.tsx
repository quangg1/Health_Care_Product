import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, Clock, Package, Users, Award, X, Activity } from 'lucide-react';
import BMIChart from '../components/BmiCalculator';

const HomePage: React.FC = () => {
  const [isBmiModalOpen, setIsBmiModalOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Sản phẩm chính hãng',
      description: '100% thuốc và sản phẩm sức khỏe chính hãng, có giấy phép lưu hành'
    },
    {
      icon: Truck,
      title: 'Giao hàng nhanh chóng',
      description: 'Giao hàng toàn quốc trong 24-48h, miễn phí vận chuyển cho đơn hàng từ 500k'
    },
    {
      icon: Clock,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn chuyên nghiệp, sẵn sàng hỗ trợ mọi lúc'
    }
  ];
  return (
    <div className="min-h-screen">
      {isBmiModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-1/2 relative">
            <button
              onClick={() => setIsBmiModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Chỉ số BMI</h2>
            <BMIChart />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Chăm sóc sức khỏe
                <span className="block text-yellow-300">tại nhà</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Cung cấp thuốc và sản phẩm sức khỏe chất lượng cao với dịch vụ tận tâm
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Mua sắm ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/contact"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                >
                  Liên hệ tư vấn
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Package className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">10,000+</h3>
                    <p className="text-sm text-blue-100">Sản phẩm</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">50,000+</h3>
                    <p className="text-sm text-blue-100">Khách hàng</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Award className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">5 năm+</h3>
                    <p className="text-sm text-blue-100">Kinh nghiệm</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Shield className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="font-semibold">100%</h3>
                    <p className="text-sm text-blue-100">Chính hãng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn chúng tôi?</h2>
            <p className="text-lg text-gray-600">Cam kết mang đến dịch vụ tốt nhất cho sức khỏe của bạn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Danh mục sản phẩm</h2>
            <p className="text-lg text-gray-600">Khám phá các loại sản phẩm sức khỏe đa dạng</p>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsBmiModalOpen(true)}
              className="bg-indigo-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center mx-auto text-lg"
            >
              <Activity className="mr-3 h-6 w-6" />
              Kiểm tra chỉ số BMI
            </button>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bắt đầu chăm sóc sức khỏe ngay hôm nay</h2>
          <p className="text-xl text-blue-100 mb-8">
            Khám phá hàng nghìn sản phẩm sức khỏe chất lượng cao
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;