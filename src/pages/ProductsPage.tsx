import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService, ProductFrontend, ProductCategory } from '../services/productService';

const ProductsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [allProducts, setAllProducts] = useState<ProductFrontend[]>([]);
    const [mainCategories, setMainCategories] = useState<ProductCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [subCategories, setSubCategories] = useState<{ name: string; count: number }[]>([]);

    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
    const [sortBy, setSortBy] = useState('name');

    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20
    });
    const [localPriceRange, setLocalPriceRange] = useState(priceRange);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const res = await productService.getMainCategories();
                setMainCategories(res.data);
            } catch (err) {
                setCategoriesError('Failed to load categories.');
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedMainCategory) {
            productService.getSubcategories(selectedMainCategory).then(res => setSubCategories(res.data));
        } else {
            setSubCategories([]);
        }
    }, [selectedMainCategory]);

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        const params: any = {
            search: searchQuery,
            page,
            limit: pagination.itemsPerPage,
            sortBy,
        };
        if (selectedMainCategory) params.main_category = selectedMainCategory;
        if (selectedSubCategory) params.sub_category = selectedSubCategory;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;

        try {
            const res = await productService.getProducts(params);
            setAllProducts(res.data.map(productService.transformProductToProduct));
            setPagination(res.pagination);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, priceRange, sortBy, selectedMainCategory, selectedSubCategory, pagination.itemsPerPage]);

    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    useEffect(() => {
        setLocalPriceRange(priceRange);
    }, [priceRange]);


    const handlePriceFilterApply = () => {
        setPriceRange(localPriceRange);
    };


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchProducts(newPage);
        }
    };

    if (categoriesLoading) {
        return <div className="text-center py-12">Đang tải danh mục...</div>;
    }

    if (categoriesError) {
        return <div className="text-center py-12 text-red-500">{categoriesError}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex flex-wrap gap-3">
                <button
                    onClick={() => {
                        setSelectedMainCategory('');
                        setSelectedSubCategory('');
                    }}
                    className={`px-6 py-3 rounded-lg text-base font-semibold border transition ${!selectedMainCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                        }`}
                >
                    Tất cả
                </button>
                {mainCategories.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => {
                            setSelectedMainCategory(cat.name);
                            setSelectedSubCategory('');
                        }}
                        className={`px-6 py-3 rounded-lg text-base font-semibold border transition ${selectedMainCategory === cat.name
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                            }`}
                    >
                        {cat.name} ({cat.count})
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-64">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-4">Bộ lọc</h3>
                        {subCategories.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-medium mb-3">Danh mục phụ</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="subcategory"
                                            value=""
                                            checked={selectedSubCategory === ''}
                                            onChange={() => setSelectedSubCategory('')}
                                            className="mr-2"
                                        />
                                        Tất cả
                                    </label>
                                    {subCategories.map((cat) => (
                                        <label key={cat.name} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="subcategory"
                                                value={cat.name}
                                                checked={selectedSubCategory === cat.name}
                                                onChange={() => setSelectedSubCategory(cat.name)}
                                                className="mr-2"
                                            />
                                            {cat.name} ({cat.count})
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h4 className="font-medium mb-3">Khoảng giá</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Từ</label>
                                    <input
                                        type="number"
                                        value={localPriceRange.min}
                                        onChange={(e) => setLocalPriceRange({ ...localPriceRange, min: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Đến</label>
                                    <input
                                        type="number"
                                        value={localPriceRange.max}
                                        onChange={(e) => setLocalPriceRange({ ...localPriceRange, max: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handlePriceFilterApply}
                                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-3">Sắp xếp</h4>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">Tên (A-Z)</option>
                                <option value="price-asc">Giá (Thấp đến cao)</option>
                                <option value="price-desc">Giá (Cao đến thấp)</option>

                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="ml-2 text-gray-600">Đang tải...</span>
                        </div>
                    ) : allProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                Không tìm thấy sản phẩm phù hợp.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {allProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        viewMode="grid"
                                    />
                                ))}
                            </div>
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Trước
                                    </button>
                                    <span className="px-3 py-2 text-gray-600">
                                        Trang {pagination.currentPage} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Sau
                                    </button>
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