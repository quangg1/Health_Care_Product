import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product as CartProduct } from '../context/CartContext';
import { productService, ProductFrontend } from '../services/productService';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductFrontend | null>(null);
  const [loading, setLoading] = useState(true);

  // Popup state
  const [showDetails, setShowDetails] = useState(false);
  const [showProductInfo, setShowProductInfo] = useState(false);
  const [showUsageGuideImage, setShowUsageGuideImage] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(id!);
        setProduct(productService.transformProductToProduct(res.data));
      } catch (error) {
        setProduct(null);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  const formatPrice = (price: number | string) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));

  // Chuẩn hóa ProductFrontend sang Cart Product (đủ field bắt buộc)
  const toCartProduct = (p: ProductFrontend): CartProduct => ({
    id: p.id,
    name: p.name,
    price: Number(p.price) || 0,
    unitPrice: undefined,
    originalPrice: undefined,
    image: p.image || p.imageUrl || '',
    category: p.main_category || p.sub_category || 'Khác',
    description: p.description || '',
    rating: 0,
    reviews: 0,
    inStock: true,
    prescription: undefined,
    ingredients: p.thanhPhan,
    dosage: undefined,
    sideEffects: undefined,
    manufacturer: p.manufacturer,
    soDangKy: p.soDangKy,
    dangBaoChe: p.dangBaoChe,
    dongGoi: p.dongGoi || p.packaging,
    hanSuDung: p.hanSuDung || p.expiryDate,
    quocGia: p.quocGia || p.country,
    linkChiTiet: p.linkChiTiet,
    main_category: p.main_category,
    sub_category: p.sub_category,
    giaThuoc: undefined,
    packaging: p.packaging,
    packagingOptions: undefined,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-blue-600">Đang tải...</span>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12 text-red-600">Không tìm thấy sản phẩm.</div>;
  }

  // Render details
  const renderDetailsRows = () => {
    if (!product.details || typeof product.details !== 'object') return null;
    return Object.entries(product.details).map(([key, value]) => (
      <tr key={`details-${key}`}>
        <td className="font-medium pr-4 py-1 align-top text-gray-700">{key}</td>
        <td className="py-1 text-gray-700">{String(value)}</td>
      </tr>
    ));
  };

  // Render product_info
  const renderProductInfoRows = () => {
    if (!product.product_info) return null;
    if (typeof product.product_info === 'object') {
      return Object.entries(product.product_info).map(([key, value]) => (
        <tr key={`productinfo-${key}`}>
          <td className="font-medium pr-4 py-1 align-top text-gray-700">{key}</td>
          <td className="py-1 text-gray-700">{String(value)}</td>
        </tr>
      ));
    } else if (typeof product.product_info === 'string') {
      return (
        <tr key="productinfo-string">
          <td className="font-medium pr-4 py-1 align-top text-gray-700">Thông tin khác</td>
          <td className="py-1 text-gray-700">{product.product_info}</td>
        </tr>
      );
    }
    return null;
  };

  // Render product_info content with rich formatting when it's a string
  const renderProductInfoContent = () => {
    const info = product.product_info as any;
    if (!info) return null;

    if (typeof info === 'object') {
      return (
        <table className="w-full border border-gray-200 rounded">
          <tbody>
            {Object.entries(info).map(([key, value]) => (
              <tr key={`productinfo-${key}`}>
                <td className="font-medium pr-4 py-1 align-top text-gray-700">{key}</td>
                <td className="py-1 text-gray-700">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    const text = String(info || '').trim();
    if (!text) return null;

    type Section = { title: string; body: string };
    const sections: Section[] = [];
    const regex = /(^|\n)\s*(\d+)\.\s*([^\n:]+):?/g;
    let match: RegExpExecArray | null;
    const indices: { pos: number; title: string }[] = [];

    while ((match = regex.exec(text)) !== null) {
      const pos = match.index + (match[1] ? match[1].length : 0);
      indices.push({ pos, title: match[3].trim() });
    }

    if (indices.length) {
      for (let i = 0; i < indices.length; i++) {
        const start = indices[i].pos;
        const end = i < indices.length - 1 ? indices[i + 1].pos : text.length;
        const title = indices[i].title;
        const afterTitleLineBreak = text.indexOf('\n', start);
        const rawBody =
          afterTitleLineBreak !== -1 && afterTitleLineBreak < end
            ? text.slice(afterTitleLineBreak + 1, end)
            : text.slice(start, end).replace(/^\s*\d+\.\s*[^\n:]+:?\s*/, '');
        const body = rawBody.trim();
        sections.push({ title, body });
      }
    } else {
      sections.push({ title: 'Thông tin sản phẩm', body: text });
    }

    const renderBody = (body: string) => {
      const lines = body
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);

      // If many lines, display as bullet list; otherwise, keep paragraph with preserved breaks
      if (lines.length > 1) {
        return (
          <ul className="list-disc pl-5 space-y-1">
            {lines.map((l, idx) => (
              <li key={idx} className="text-gray-700">
                {l}
              </li>
            ))}
          </ul>
        );
      }

      return <p className="text-gray-700 whitespace-pre-line">{body}</p>;
    };

    return (
      <div className="space-y-4 leading-relaxed break-words">
        {sections.map((sec, idx) => (
          <section key={idx}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{sec.title}</h3>
            {renderBody(sec.body)}
          </section>
        ))}
      </div>
    );
  };
  
  // Modal component
  const Modal: React.FC<{ show: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
    show,
    onClose,
    title,
    children,
  }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
            aria-label="Đóng"
          >
            ×
          </button>
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <div className="max-h-[60vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Ảnh sản phẩm */}
        <div className="flex-shrink-0 w-full md:w-96 flex items-center justify-center bg-gray-50 rounded border">
          <img
            src={product.image || product.imageUrl}
            alt={product.name}
            className="w-full h-96 object-contain"
          />
        </div>
        {/* Thông tin chính */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">{product.name}</h1>
          <div className="mb-3 text-2xl text-blue-600 font-bold">
            {product.price && Number(product.price) > 0 ? formatPrice(product.price) : 'Chưa có giá'}
          </div>
          <div className="mb-3 text-base text-gray-700">{product.description}</div>
          {/* Bảng thông tin sản phẩm */}
          <table className="w-full mb-4 border border-gray-200 rounded">
            <tbody>
              {product.dosageForm && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Dạng bào chế</td>
                  <td className="py-1 text-gray-700">{product.dosageForm}</td>
                </tr>
              )}
              {product.packaging && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Đóng gói</td>
                  <td className="py-1 text-gray-700">{product.packaging}</td>
                </tr>
              )}
              {product.expiryDate && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Hạn sử dụng</td>
                  <td className="py-1 text-gray-700">{product.expiryDate}</td>
                </tr>
              )}
              {(product.manufacturer || product.brand) && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Nhà sản xuất</td>
                  <td className="py-1 text-gray-700">{product.manufacturer || product.brand}</td>
                </tr>
              )}
              {product.congTyDk && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Công ty đăng ký</td>
                  <td className="py-1 text-gray-700">{product.congTyDk}</td>
                </tr>
              )}
              {product.country && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Quốc gia</td>
                  <td className="py-1 text-gray-700">{product.country}</td>
                </tr>
              )}
              {product.soDangKy && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Số đăng ký</td>
                  <td className="py-1 text-gray-700">{product.soDangKy}</td>
                </tr>
              )}
              {product.main_category && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Danh mục</td>
                  <td className="py-1 text-gray-700">{product.main_category}</td>
                </tr>
              )}
              {product.sub_category && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Danh mục phụ</td>
                  <td className="py-1 text-gray-700">{product.sub_category}</td>
                </tr>
              )}
              {product.thanhPhan && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Thành phần</td>
                  <td className="py-1 text-gray-700">{product.thanhPhan}</td>
                </tr>
              )}
              {product.huongDan && (
                <tr>
                  <td className="font-medium pr-4 py-1 align-top text-gray-700">Hướng dẫn sử dụng</td>
                  <td className="py-1 text-gray-700">{product.huongDan}</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Link hướng dẫn sử dụng nếu có */}
          {product.usageGuideHref && (
            <div className="mb-2 mt-2">
              <a
                href={product.usageGuideHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Xem hướng dẫn sử dụng chi tiết
              </a>
            </div>
          )}
          {/* Nút popup */}
          <div className="flex flex-wrap gap-3 mt-4">
            {product.details && (
              <button
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-blue-100 text-blue-700 font-medium"
                onClick={() => setShowDetails(true)}
              >
                Xem chi tiết sản phẩm
              </button>
            )}
            {product.product_info && (
              <button
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-blue-100 text-blue-700 font-medium"
                onClick={() => setShowProductInfo(true)}
              >
                Xem thông tin sản phẩm
              </button>
            )}
            {product.usageGuideImage && (
              <button
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-blue-100 text-blue-700 font-medium"
                onClick={() => setShowUsageGuideImage(true)}
              >
                Xem hình ảnh hướng dẫn sử dụng
              </button>
            )}
          </div>
          {/* Nút thêm vào giỏ */}
          <button
            className="mt-6 bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 text-lg font-semibold flex items-center justify-center"
            onClick={() => addToCart(toCartProduct(product))}
            disabled={!product.price || Number(product.price) <= 0}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
      {/* Các popup */}
      <Modal show={showDetails} onClose={() => setShowDetails(false)} title="Chi tiết sản phẩm">
        <table className="w-full border border-gray-200 rounded">
          <tbody>{renderDetailsRows()}</tbody>
        </table>
      </Modal>
      <Modal show={showProductInfo} onClose={() => setShowProductInfo(false)} title="Thông tin sản phẩm">
        {renderProductInfoContent()}
      </Modal>
      <Modal show={showUsageGuideImage} onClose={() => setShowUsageGuideImage(false)} title="Hình ảnh hướng dẫn sử dụng">
        <div className="flex flex-col items-center">
          <img
            src={product.usageGuideImage}
            alt="Hướng dẫn sử dụng"
            className="w-full max-w-lg rounded border bg-white cursor-zoom-in transition-transform duration-200 hover:scale-105"
            onClick={() => setZoomImage(true)}
            title="Nhấn để phóng to"
          />
          <span className="text-xs text-gray-500 mt-2">Nhấn vào ảnh để phóng to</span>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;