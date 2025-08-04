import React from 'react';

const HealthNewsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-4">Bản tin sức khỏe</h1>
      <div className="space-y-6">
        <article className="border-b pb-4">
          <h2 className="text-xl font-semibold">Lợi ích của việc nuôi con bằng sữa mẹ</h2>
          <p className="text-gray-600">Nuôi con bằng sữa mẹ trong 6 tháng đầu giúp tăng cường hệ miễn dịch và phát triển toàn diện.</p>
        </article>
        <article className="border-b pb-4">
          <h2 className="text-xl font-semibold">Chế độ dinh dưỡng cho bà bầu</h2>
          <p className="text-gray-600">Cung cấp đầy đủ vitamin và khoáng chất giúp thai nhi phát triển khỏe mạnh.</p>
        </article>
      </div>
    </div>
  );
};

export default HealthNewsPage;
