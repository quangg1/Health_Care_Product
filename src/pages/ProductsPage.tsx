import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { drugService, DrugCategory } from '../services/drugService';
import { Product } from '../context/CartContext';

const ProductsPage: React.FC = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<DrugCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Fetch drugs from API
  const fetchDrugs = async (page: number = 1, search: string = '', category: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await drugService.getDrugs({
        page,
        limit: 20,
        search,
        category: category === 'all' ? '' : category
      });

      const transformedProducts = response.data.map(drug => drugService.transformDrugToProduct(drug));
      setAllProducts(transformedProducts);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching drugs:', err);
      setError('Không thể tải danh sách thuốc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await drugService.getDrugCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDrugs(1, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Debounce function for better performance
  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const handlePriceChange = useCallback(
    debounce((newRange) => setPriceRange(newRange), 300),
    []
  );

  // Filter and sort products using useMemo for better performance
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(product => {
        const productPrice = product.price || 0;
        return (
          productPrice >= priceRange.min &&
          productPrice <= priceRange.max &&
          (selectedCategory === 'all' || product.category === selectedCategory)
        );
      })
      .sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;

        switch (sortBy) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
          default:
            return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
        }
      });
  }, [allProducts, priceRange, sortBy, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading && allProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải danh sách thuốc...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => fetchDrugs(1, searchQuery, selectedCategory)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 
             selectedCategory === 'all' ? 'Tất cả thuốc' : 
             selectedCategory}
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} sản phẩm được hiển thị
            {pagination.totalPages > 1 && ` (Trang ${pagination.currentPage}/${pagination.totalPages})`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Bộ lọc</h3>
            
            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Công ty</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                  />
                  Tất cả công ty
                </label>
                {categories.map((cat) => (
                  <label key={cat.name} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={cat.name}
                      checked={selectedCategory === cat.name}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2"
                    />
                    {cat.name} ({cat.count})
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Khoảng giá</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Giá tối thiểu</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Giá tối đa</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="font-medium mb-3">Sắp xếp theo</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Tên (A-Z)</option>
                <option value="price-low">Giá (Thấp đến cao)</option>
                <option value="price-high">Giá (Cao đến thấp)</option>
                <option value="rating">Đánh giá (Cao đến thấp)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          )}
          
          {!loading && filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.
              </p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                    priceDisplay={product.packaging ? `${product.price} VND (${product.packaging})` : `${product.price} VND`}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchDrugs(pagination.currentPage - 1, searchQuery, selectedCategory)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    
                    <span className="px-3 py-2 text-gray-600">
                      Trang {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => fetchDrugs(pagination.currentPage + 1, searchQuery, selectedCategory)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;