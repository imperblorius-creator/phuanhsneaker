import React from 'react';

export const FeaturesBar: React.FC = () => {
  return (
    <section className="border-t border-b border-gray-200 py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <i className="ph ph-truck text-4xl mb-3 text-black"></i>
            <h4 className="font-bold text-sm uppercase mb-1">Giao hàng toàn quốc</h4>
            <p className="text-xs text-gray-500">Nhận đơn và tư vấn qua hotline</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ph ph-shield-check text-4xl mb-3 text-black"></i>
            <h4 className="font-bold text-sm uppercase mb-1">Sản phẩm PhuAnh</h4>
            <p className="text-xs text-gray-500">Danh mục được cập nhật thường xuyên</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ph ph-arrows-left-right text-4xl mb-3 text-black"></i>
            <h4 className="font-bold text-sm uppercase mb-1">Liên hệ cửa hàng</h4>
            <p className="text-xs text-gray-500">Email: phuanhsneaker@gmail.com</p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ph ph-headset text-4xl mb-3 text-black"></i>
            <h4 className="font-bold text-sm uppercase mb-1">Hỗ trợ khách hàng</h4>
            <p className="text-xs text-gray-500">Hotline: 0397233999</p>
          </div>
        </div>
      </div>
    </section>
  );
};
