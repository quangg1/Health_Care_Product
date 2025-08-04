import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Drug {
  _id: string;
  soDangKy: string;
  tenThuoc: string;
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
  hoatChatVaNongDo?: string;
  huongDan?: string;
  giaThuoc?: Array<{
    ngayKeKhai: string;
    donViKeKhai: string;
    dongGoi: string;
    giaKeKhai: string;
    donViTinh: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DrugCategory {
  name: string;
  count: number;
}

export interface DrugsResponse {
  success: boolean;
  data: Drug[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface DrugResponse {
  success: boolean;
  data: Drug;
}

export interface CategoriesResponse {
  success: boolean;
  data: DrugCategory[];
}

export interface DrugsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

class DrugService {
  // Get all drugs with pagination and search
  async getDrugs(params: DrugsQueryParams = {}): Promise<DrugsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/drugs`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching drugs:', error);
      throw error;
    }
  }

  // Get drug by ID
  async getDrugById(id: string): Promise<DrugResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/drugs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drug:', error);
      throw error;
    }
  }

  // Get drug categories
  async getDrugCategories(): Promise<CategoriesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/drugs/categories/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Transform drug data to match frontend Product interface
  transformDrugToProduct(drug: Drug) {
    // Get the latest price and packaging details from giaThuoc array
    let latestPrice = 0;
    let packaging = '';
    if (drug.giaThuoc && drug.giaThuoc.length > 0) {
      const latestGiaThuoc = drug.giaThuoc[drug.giaThuoc.length - 1];
      if (latestGiaThuoc) {
        // Extract price and packaging details
        const priceString = latestGiaThuoc.giaKeKhai.replace(/[^\d.,]/g, '').replace(',', '.');
        latestPrice = parseFloat(priceString) || 0;
        packaging = latestGiaThuoc.dongGoi || '';
      }
    }

    return {
      id: drug._id,
      name: drug.tenThuoc,
      price: latestPrice,
      packaging: packaging,
      priceDisplay: packaging ? `${latestPrice} VND (${packaging})` : `${latestPrice} VND`,
      image: drug.imageUrl || 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: drug.congTy || 'Thuốc',
      description: drug.thanhPhan || 'Không có mô tả',
      rating: 4.5, // Default rating since drug model doesn't have rating
      reviews: 0, // Default reviews since drug model doesn't have reviews
      inStock: true, // Default in stock
      prescription: false, // Default no prescription required
      ingredients: drug.thanhPhan,
      dosage: drug.huongDan,
      manufacturer: drug.congTySx || drug.congTy,
      // Additional drug-specific fields
      soDangKy: drug.soDangKy,
      dangBaoChe: drug.dangBaoChe,
      dongGoi: drug.dongGoi,
      hanSuDung: drug.hanSuDung,
      quocGia: drug.quocGia,
      linkChiTiet: drug.linkChiTiet,
      giaThuoc: drug.giaThuoc
    };
  }
}

export const drugService = new DrugService();