'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { useDamagedProducts } from '../hooks/useDamagedProducts';

interface DamagedProduct {
  product_name: string;
  quantity: string;
  unit_of_measurement: string;
  customer_name: string;
  date: string;
}

const DamagedProductsWidget: React.FC = () => {
  const { damagedProducts, isLoading, error } = useDamagedProducts();

  const calculateTotalDamage = () => {
    return damagedProducts.reduce((total: number, item: DamagedProduct) => {
      const qty = Number(item.quantity);
      return total + (Number.isNaN(qty) ? 0 : qty);
    }, 0);
  };

  const recentDamages = damagedProducts.slice(0, 3);

  return (
    <div className="bg-white shadow rounded-xl p-6 border border-red-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiAlertTriangle className="text-red-500 mr-2 text-xl" />
          Damaged Products
        </h3>
        <Link 
          to="/damageproducts" 
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm py-2">Error: {error}</div>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-4xl font-extrabold text-red-600">
              {calculateTotalDamage()}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total damaged items</div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Recent damages</h4>
            {recentDamages.length > 0 ? (
              recentDamages.map((item: DamagedProduct, index: number) => (
                <div key={index} className="border-l-4 border-red-300 pl-4 py-2 bg-red-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.product_name}
                    </span>
                    <span className="text-sm text-red-700">
                      {item.quantity} {item.unit_of_measurement}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate" title={item.customer_name}>
                    {item.customer_name} • {item.date}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-2">No recent damages</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DamagedProductsWidget;
