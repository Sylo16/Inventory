'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { useDamagedProducts } from '../hooks/useDamagedProducts';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="rounded-2xl p-6 shadow-sm border border-red-200 bg-white/70 backdrop-blur-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-red-600 flex items-center">
          <FiAlertTriangle className="mr-2 text-xl" />
          Damaged Products
        </h3>
        <Link 
          to="/damageproducts" 
          className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition"
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
            <div className="text-5xl font-extrabold text-red-500 drop-shadow-sm">
              {calculateTotalDamage()}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total damaged items</div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Recent Damages</h4>
            {recentDamages.length > 0 ? (
              recentDamages.map((item: DamagedProduct, index: number) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-red-50 to-white border-l-4 border-red-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-800">
                      {item.product_name}
                    </span>
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      {item.quantity} {item.unit_of_measurement}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate" title={item.customer_name}>
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
    </motion.div>
  );
};

export default DamagedProductsWidget;
