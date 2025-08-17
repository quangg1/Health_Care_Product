import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ChaosFooter from './ChaosFooter';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'Giới thiệu', href: '/about' },
      { name: 'Tin tức', href: '/news' },
      { name: 'Tuyển dụng', href: '/careers' },
      { name: 'Liên hệ', href: '/contact' }
    ],
    products: [
      { name: 'Thuốc kê đơn', href: '/products?category=prescription' },
      { name: 'Thuốc không kê đơn', href: '/products?category=otc' },
      { name: 'Thực phẩm chức năng', href: '/products?category=supplements' },
      { name: 'Thiết bị y tế', href: '/products?category=medical-devices' }
    ],
    services: [
      { name: 'Tư vấn sức khỏe', href: '/services/consultation' },
      { name: 'Đặt lịch khám', href: '/services/appointments' },
      { name: 'Giao hàng tận nhà', href: '/services/delivery' },
      { name: 'Hỗ trợ 24/7', href: '/services/support' }
    ],
    support: [
      { name: 'Hướng dẫn mua hàng', href: '/help/shopping-guide' },
      { name: 'Chính sách đổi trả', href: '/help/return-policy' },
      { name: 'Bảo mật thông tin', href: '/help/privacy' },
      { name: 'Điều khoản sử dụng', href: '/help/terms' }
    ]
  };


  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HealthCare
              </span>
            </div>
            <p className="text-gray-300 mb-6">
              Cung cấp thuốc và sản phẩm sức khỏe chất lượng cao với dịch vụ tận tâm, 
              đảm bảo sức khỏe tốt nhất cho mọi gia đình Việt Nam.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-3" />
                <span>1900-6035</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-3" />
                <span>contact@healthcare.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-3" />
                <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="h-4 w-4 mr-3" />
                <span>24/7 - Hỗ trợ mọi lúc</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <ChaosFooter />
            </div>
            <div className="text-gray-400 text-sm">
              © {currentYear} HealthCare. Tất cả quyền được bảo lưu.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex flex-wrap justify-center md:justify-start space-x-4 mb-2 md:mb-0">
              <Link to="/help/privacy" className="hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/help/terms" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/help/cookies" className="hover:text-white transition-colors">
                Chính sách cookie
              </Link>
            </div>
            <div className="text-center md:text-right">
              <p>Được cấp phép bởi Bộ Y tế - Giấy phép số: 12345/GP-BYT</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
