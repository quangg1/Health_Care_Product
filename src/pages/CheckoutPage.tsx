import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Truck, MapPin, Phone, User, Calendar, Clock } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

  const mapboxToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined;

  const storeCoords = { lat: 10.775658, lng: 106.700424 };
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMode, setLocationMode] = useState<'address' | 'current'>('address');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [routeGeo, setRouteGeo] = useState<any | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const storeMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const VN_BOUNDS: [[number, number], [number, number]] = [[102.14441, 8.179], [109.464, 23.392]];
  const isWithinVN = (lng: number, lat: number) => lng >= VN_BOUNDS[0][0] && lng <= VN_BOUNDS[1][0] && lat >= VN_BOUNDS[0][1] && lat <= VN_BOUNDS[1][1];
  const [pickOnMap, setPickOnMap] = useState(false);

  // Order preview state
  const [orderPreview, setOrderPreview] = useState<{ subtotal: number; shippingCost: number; totalAmount: number; distanceKm: number | null; prepMin: number; deliveryMin: number; totalMin: number }>({
    subtotal: 0,
    shippingCost: 0,
    totalAmount: 0,
    distanceKm: null,
    prepMin: 30,
    deliveryMin: 0,
    totalMin: 30,
  });

  // Suggestions state
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
  const [wardSuggestions, setWardSuggestions] = useState<string[]>([]);
  const cityDebounceRef = useRef<any>(null);
  const districtDebounceRef = useRef<any>(null);
  const wardDebounceRef = useRef<any>(null);

  const formatDuration = (minutes: number) => {
    const m = Math.max(0, Math.round(minutes));
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h <= 0) return `${mm} phút`;
    return mm > 0 ? `${h} giờ ${mm} phút` : `${h} giờ`;
  };

  const fetchRoute = async (coords: { lat: number; lng: number }) => {
    if (!mapboxToken) return; // cannot call directions without token
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${storeCoords.lng},${storeCoords.lat};${coords.lng},${coords.lat}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const r = data.routes[0];
        const distanceKm = r.distance / 1000; // meters -> km
        const durationMin = r.duration / 60; // seconds -> minutes
        setRouteInfo({ distanceKm, durationMin });
        setRouteGeo(r.geometry as any);
      }
    } catch (e) {
      // ignore, we will fallback to haversine
    }
  };

  useEffect(() => {
    if (userCoords && mapboxToken) {
      fetchRoute(userCoords);
    }
  }, [userCoords, mapboxToken]);

  useEffect(() => {
    if (!mapboxToken) return;
    (mapboxgl as any).accessToken = mapboxToken;
    if (mapRef.current || !mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      bounds: [[102.14441, 8.179], [109.464, 23.392]],
      fitBoundsOptions: { padding: 80 },
    });
    map.once('load', () => map.resize());
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [mapboxToken, userCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Update markers
    if (storeMarkerRef.current) storeMarkerRef.current.remove();
    storeMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([storeCoords.lng, storeCoords.lat])
      .addTo(map);
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
    if (userCoords) {
      userMarkerRef.current = new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([userCoords.lng, userCoords.lat])
        .addTo(map);
      const [lng, lat] = [userCoords.lng, userCoords.lat];
      if (!isWithinVN(lng, lat)) {
        map.fitBounds(VN_BOUNDS, { padding: 80, duration: 800 });
      }
    }

    // Update route layer
    const sourceId = 'route';
    const layerId = 'route-line';
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    if (routeGeo && routeGeo.coordinates && routeGeo.coordinates.length > 1) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'Feature', geometry: routeGeo, properties: {} }
      });
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#0ea5e9', 'line-width': 4 }
      });
      const coords: [number, number][] = routeGeo.coordinates;
      let minLng = coords[0][0], minLat = coords[0][1], maxLng = coords[0][0], maxLat = coords[0][1];
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, duration: 800, maxZoom: 15 });
    } else if (userCoords) {
      const bounds = new mapboxgl.LngLatBounds([storeCoords.lng, storeCoords.lat], [storeCoords.lng, storeCoords.lat]);
      bounds.extend([userCoords.lng, userCoords.lat]);
      map.fitBounds(bounds, { padding: 80, duration: 800, maxZoom: 15 });
    } else {
      map.fitBounds([[102.14441, 8.179], [109.464, 23.392]], { padding: 80, duration: 800 });
    }

    // Handle pick-on-map mode
    let clickHandler: any;
    if (pickOnMap) {
      map.getCanvas().style.cursor = 'crosshair';
      clickHandler = (e: any) => {
        const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        setUserCoords(coords);
        reverseGeocode(coords);
        setPickOnMap(false);
      };
      map.on('click', clickHandler);
    } else {
      map.getCanvas().style.cursor = '';
    }

    return () => {
      if (clickHandler) {
        map.off('click', clickHandler);
      }
    };
  }, [userCoords, routeGeo, pickOnMap]);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const haversineDistance = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sa = Math.sin(dLat / 2);
    const sb = Math.sin(dLng / 2);
    const h = sa * sa + Math.cos(lat1) * Math.cos(lat2) * sb * sb;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  };
  const computeShippingCost = (distanceKm: number | null, subtotal: number) => {
    if (subtotal >= 500000) return 0;
    if (distanceKm === null) return 30000;
    if (distanceKm <= 5) return 15000;
    if (distanceKm <= 10) return 25000;
    if (distanceKm <= 20) return 40000;
    return 60000;
  };

  const buildAddressQuery = (addr: ShippingAddress) => {
    const parts = [addr.address, addr.ward, addr.district, addr.city, 'Việt Nam'].filter(Boolean);
    return parts.join(', ');
  };

  const geocodeAddress = async () => {
    if (!mapboxToken) {
      setLocationError('Cần cấu hình VITE_MAPBOX_TOKEN để định vị theo địa chỉ.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    try {
      const query = encodeURIComponent(buildAddressQuery(shippingAddress));
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&limit=1&country=VN&language=vi&proximity=${storeCoords.lng},${storeCoords.lat}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setUserCoords({ lat, lng });
      } else {
        setLocationError('Không tìm thấy toạ độ cho địa chỉ đã nhập.');
      }
    } catch (e) {
      setLocationError('Lỗi khi xác định vị trí từ địa chỉ.');
    } finally {
      setIsLocating(false);
    }
  };

  // Reverse geocode user coordinates to fill address fields
  const reverseGeocode = async (coords: { lat: number; lng: number }) => {
    if (!mapboxToken) return;
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=${mapboxToken}&language=vi&country=VN&types=address,locality,neighborhood,place,region,district`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data || !data.features || data.features.length === 0) return;
      let city = '';
      let district = '';
      let ward = '';
      let address = '';

      const first = data.features[0];
      if (first.place_type && first.place_type.includes('address')) {
        address = first.place_name;
      }
      const ctx = [...(first.context || []), first];
      for (const c of ctx) {
        const id: string = c.id || '';
        const text: string = c.text || '';
        if (id.startsWith('region')) city = city || text;
        if (id.startsWith('place')) city = city || text;
        if (id.startsWith('district')) district = district || text;
        if (id.startsWith('locality') || id.startsWith('neighborhood')) ward = ward || text;
      }
      setShippingAddress(prev => ({ ...prev, address, city: city || prev.city, district: district || prev.district, ward: ward || prev.ward }));
    } catch (e) {
      // ignore
    }
  };

  // Suggestion fetchers
  const fetchCitySuggestions = async (q: string) => {
    if (!mapboxToken || !q) { setCitySuggestions([]); return; }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxToken}&country=VN&language=vi&types=place,region&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    setCitySuggestions((data.features || []).map((f: any) => f.text));
  };
  const fetchDistrictSuggestions = async (q: string, city?: string) => {
    if (!mapboxToken || !q) { setDistrictSuggestions([]); return; }
    const query = city ? `${q}, ${city}` : q;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=VN&language=vi&types=district&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    setDistrictSuggestions((data.features || []).map((f: any) => f.text));
  };
  const fetchWardSuggestions = async (q: string, district?: string, city?: string) => {
    if (!mapboxToken || !q) { setWardSuggestions([]); return; }
    const query = [q, district, city].filter(Boolean).join(', ');
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=VN&language=vi&types=locality,neighborhood&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    setWardSuggestions((data.features || []).map((f: any) => f.text));
  };

  const distanceKm = routeInfo ? routeInfo.distanceKm : (userCoords ? haversineDistance(userCoords, storeCoords) : null);
  const subtotal = getTotalPrice();
  const shippingCost = computeShippingCost(distanceKm, subtotal);
  const totalAmount = subtotal + shippingCost;
  const prepMin = 30; // thời gian chuẩn bị đơn ước tính
  const deliveryMin = routeInfo ? Math.ceil(routeInfo.durationMin) : (distanceKm ? Math.ceil(distanceKm * 2) : 0); // ~2 phút/km fallback
  const totalMin = prepMin + deliveryMin;

  useEffect(() => {
    setOrderPreview({ subtotal, shippingCost, totalAmount, distanceKm: distanceKm ?? null, prepMin, deliveryMin, totalMin });
  }, [subtotal, shippingCost, totalAmount, distanceKm, prepMin, deliveryMin, totalMin]);

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
        shippingCoords: userCoords,
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setShippingAddress(prev => ({ ...prev, city: val }));
                      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
                      cityDebounceRef.current = setTimeout(() => fetchCitySuggestions(val), 300);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {citySuggestions.length > 0 && (
                    <div className="mt-1 bg-white border rounded shadow-sm max-h-48 overflow-auto">
                      {citySuggestions.map((s, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => { setShippingAddress(prev => ({ ...prev, city: s })); setCitySuggestions([]); }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.district}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShippingAddress(prev => ({ ...prev, district: val }));
                      if (districtDebounceRef.current) clearTimeout(districtDebounceRef.current);
                      districtDebounceRef.current = setTimeout(() => fetchDistrictSuggestions(val, shippingAddress.city), 300);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {districtSuggestions.length > 0 && (
                    <div className="mt-1 bg-white border rounded shadow-sm max-h-48 overflow-auto">
                      {districtSuggestions.map((s, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => { setShippingAddress(prev => ({ ...prev, district: s })); setDistrictSuggestions([]); }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.ward}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShippingAddress(prev => ({ ...prev, ward: val }));
                      if (wardDebounceRef.current) clearTimeout(wardDebounceRef.current);
                      wardDebounceRef.current = setTimeout(() => fetchWardSuggestions(val, shippingAddress.district, shippingAddress.city), 300);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {wardSuggestions.length > 0 && (
                    <div className="mt-1 bg-white border rounded shadow-sm max-h-48 overflow-auto">
                      {wardSuggestions.map((s, idx) => (
                        <div key={idx} className="px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => { setShippingAddress(prev => ({ ...prev, ward: s })); setWardSuggestions([]); }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location and Distance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Khoảng cách & Phí vận chuyển</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setLocationMode('address'); setLocationError(null); }}
                  className={`px-3 py-2 rounded border ${locationMode==='address' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300'}`}
                >
                  Dùng địa chỉ nhận hàng
                </button>
                <button
                  type="button"
                  onClick={() => { setLocationMode('current'); setLocationError(null); }}
                  className={`px-3 py-2 rounded border ${locationMode==='current' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300'}`}
                >
                  Dùng vị trí hiện tại
                </button>
                <button
                  type="button"
                  onClick={() => { setPickOnMap(true); setLocationMode('current'); setLocationError(null); }}
                  className="px-3 py-2 rounded border bg-white border-gray-300"
                >
                  Đặt vị trí trên bản đồ
                </button>
              </div>
              {pickOnMap && (
                <div className="text-xs text-gray-600">Nhấn vào bản đồ để chọn vị trí giao hàng của bạn.</div>
              )}

              {locationMode === 'address' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    disabled={isLocating}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLocating ? 'Đang xác định vị trí...' : 'Tính theo địa chỉ nhận hàng'}
                  </button>
                  {(!mapboxToken) && (
                    <div className="text-xs text-gray-500">
                      Cần cấu hình VITE_MAPBOX_TOKEN để hiển thị bản đồ và định vị địa chỉ. Bạn vẫn có thể đặt hàng; phí sẽ được ước tính.
                    </div>
                  )}
                </div>
              )}

              {locationMode === 'current' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        setLocationError('Trình duyệt không hỗ trợ định vị.');
                        return;
                      }
                      setIsLocating(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const { latitude, longitude, accuracy } = pos.coords;
                          const coords = { lat: latitude, lng: longitude };
                          if (!isWithinVN(coords.lng, coords.lat) || (accuracy && accuracy > 1500)) {
                            setLocationError('Vị trí GPS chưa chính xác hoặc ngoài Việt Nam. Hãy dùng địa chỉ nhận hàng hoặc chọn trực tiếp trên bản đồ.');
                            setPickOnMap(true);
                          } else {
                            setUserCoords(coords);
                            setLocationError(null);
                            reverseGeocode(coords);
                          }
                          setIsLocating(false);
                        },
                        (err) => {
                          setLocationError(`Không thể lấy vị trí: ${err.message}`);
                          setIsLocating(false);
                        },
                        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
                      );
                    }}
                    disabled={isLocating}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLocating ? 'Đang xác định vị trí...' : 'Sử dụng vị trí hiện tại'}
                  </button>
                </div>
              )}

              {locationError && <div className="text-sm text-red-600">{locationError}</div>}

              {userCoords && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">Khoảng cách tới cửa hàng: {orderPreview.distanceKm?.toFixed(2)} km</div>
                  <div className="text-sm text-gray-700">Phí vận chuyển ước tính: {formatPrice(orderPreview.shippingCost)}</div>
                  <div className="text-sm text-gray-700">Chuẩn bị đơn: ~{formatDuration(orderPreview.prepMin)}</div>
                  <div className="text-sm text-gray-700">Giao đơn: ~{formatDuration(orderPreview.deliveryMin)}</div>
                  <div className="text-sm font-medium text-gray-900">Tổng thời lượng ước tính: ~{formatDuration(orderPreview.totalMin)}</div>
                </div>
              )}
              {mapboxToken ? (
                <div ref={mapContainerRef} className="w-full h-72 rounded border" />
              ) : null}
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
                <span>{formatPrice(orderPreview.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{orderPreview.shippingCost === 0 ? 'Miễn phí' : formatPrice(orderPreview.shippingCost)}</span>
              </div>
              
              {orderPreview.shippingCost > 0 && (
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  Thêm {formatPrice(500000 - orderPreview.subtotal)} để được miễn phí vận chuyển!
                </div>
              )}
              
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(orderPreview.totalAmount)}</span>
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
