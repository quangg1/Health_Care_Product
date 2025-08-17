import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Product {
  _id: string;
  name: string;
  soDangKy: string;
  thanhPhan?: string;
  congTy?: string;
  quocGia?: string;
  linkChiTiet?: string;
  imageUrl?: string;
  dangBaoChe?: string;
  dongGoi?: string;
  hanSuDung?: string;
  congTySx?: string;
  congTyDk?: string;
  huongDan?: string;
  price?: number;
  description?: string;
  main_category?: string;
  sub_category?: string;
  createdAt: string;
  updatedAt: string;
  // Các trường mở rộng nếu backend trả về
  manufacturer?: string;
  brand?: string;
  packaging?: string;
  product_info?: Record<string, any> | string;
  dosageForm?: string;
  expiryDate?: string;
  country?: string;
  image?: string;
  usageGuideHref?: string;      // Thêm dòng này
  usageGuideImage?: string;     // Thêm dòng này
  details?: Record<string, any>; // Thêm dòng này
}

export interface ProductFrontend {
  id: string;
  name: string;
  soDangKy: string;
  thanhPhan?: string;
  congTy?: string;
  quocGia?: string;
  linkChiTiet?: string;
  image?: string;
  imageUrl?: string;
  dangBaoChe?: string;
  dongGoi?: string;
  hanSuDung?: string;
  congTySx?: string;
  congTyDk?: string;
  huongDan?: string;
  price?: number;
  description?: string;
  details?: Record<string, any>;
  usageGuideHref?: string;
  usageGuideImage?: string;
  product_info?: Record<string, any> | string;
  brand?: string;
  main_category?: string;
  sub_category?: string;
  manufacturer?: string;
  packaging?: string;
  dosageForm?: string;
  expiryDate?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  name: string;
  count: number;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: ProductCategory[];
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  main_category?: string;
  sub_category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

class ProductService {
  // Get all products with pagination and search/filter
  async getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<ProductResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get all categories
  async getProductCategories(): Promise<CategoriesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get main categories
  async getMainCategories(): Promise<CategoriesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories/main`);
      return response.data;
    } catch (error) {
      console.error('Error fetching main categories:', error);
      throw error;
    }
  }

  // Get subcategories by main category
  async getSubcategories(mainCategory: string): Promise<CategoriesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories/sub/${mainCategory}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }

  // Chuẩn hóa dữ liệu product từ backend sang frontend
  transformProductToProduct(product: Product): ProductFrontend {
    return {
      id: product._id,
      name: product.name,
      soDangKy: product.soDangKy,
      thanhPhan: product.thanhPhan,
      congTy: product.congTy,
      quocGia: product.quocGia,
      linkChiTiet: product.linkChiTiet,
      image: product.imageUrl || product.image || '',
      imageUrl: product.imageUrl,
      dangBaoChe: product.dangBaoChe,
      dongGoi: product.dongGoi,
      hanSuDung: product.hanSuDung,
      congTySx: product.congTySx,
      congTyDk: product.congTyDk,
      huongDan: product.huongDan,
      price: product.price,
      description: product.description,
      details: product.details,
      usageGuideHref: product.usageGuideHref,
      usageGuideImage: product.usageGuideImage,
      product_info: product.product_info,
      brand: product.brand,
      main_category: product.main_category,
      sub_category: product.sub_category,
      manufacturer: product.congTySx || product.congTy || product.manufacturer,
      packaging: product.dongGoi || product.packaging,
      dosageForm: product.dangBaoChe || product.dosageForm,
      expiryDate: product.hanSuDung || product.expiryDate,
      country: product.quocGia || product.country,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

export const productService = new ProductService();