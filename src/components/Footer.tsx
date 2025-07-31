import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              Health<span className="text-green-500">Care</span>
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted partner for quality healthcare products and medications.
            </p>
            <div className="flex space-x-4">
              <Phone className="h-5 w-5" />
              <span>1900-6035</span>
            </div>
            <div className="flex space-x-4 mt-2">
              <Mail className="h-5 w-5" />
              <span>info@healthcare.com</span>
            </div>
            <div className="flex space-x-4 mt-2">
              <MapPin className="h-5 w-5" />
              <span>123 Health Street, Medical District</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Store Locator</Link></li>
              <li><Link to="/products/medications" className="hover:text-white">Prescription Services</Link></li>
              <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Return Policy</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe for health tips and special offers.
            </p>
            <div className="flex mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-l-lg focus:outline-none"
              />
              <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 HealthCare. All rights reserved. | Licensed Healthcare Provider</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;