import React, { useRef, useEffect } from 'react';
import { Grid, html } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
import ProfileImages from '../../assets/images/faces/14.jpg';

type Product = {
  product_id?: string;
  product_name: string;
  category: string;
  unit: string;
  quantity: string;
  purchase_date?: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  purchase_date?: string;
  products: Product[];
};

type GridRow = {
  cells: {
    data: unknown;
  }[];
};

interface CustomerTableProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
  onAddProducts: (customer: Customer) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onViewCustomer,
  onAddProducts,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<Grid | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy();
        gridRef.current.innerHTML = '';
      }

      gridInstanceRef.current = new Grid({
        columns: [
          { name: '#', width: '10px' },
          {
            name: 'Customer Name',
            width: '200px',
            formatter: (_: unknown, row: GridRow) => {
              const name = String(row.cells[1].data || '');
              return html(
                `<div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src="${ProfileImages}" alt="Avatar" class="w-full h-full object-cover" />
                  </div>
                  <span class="font-bold text-slate-700">${name}</span>
                </div>`
              );
            },
          },
          { name: 'Phone', width: '100px' },
          { name: 'Purchase Date', width: '150px' },
          {
            name: 'Actions',
            width: '100px',
            formatter: (_: unknown, row: GridRow) => {
              const customerData = {
                id: String(row.cells[0].data || ''),
                name: String(row.cells[1].data || ''),
                phone: String(row.cells[2].data || ''),
                purchase_date: String(row.cells[3].data || ''),
                products: row.cells[4].data || [],
              };
              return html(
                `<div class="flex justify-center gap-2">
                  <button 
                    class="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 view-btn group"
                    data-customer='${JSON.stringify(customerData)}'>
                    <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Details
                  </button>                
                </div>`
              );
            },
          },
        ],
        pagination: { limit: 10 },
        search: true,
        sort: true,
        data: customers.map((customer, index) => [
          customer.id || (index + 1).toString(),
          customer.name,
          customer.phone || '',
          customer.purchase_date?.split('T')[0] || '',
          Array.isArray(customer.products) ? customer.products : [],
        ]),
      });

      gridInstanceRef.current.render(gridRef.current);

      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const viewBtn = target.closest('.view-btn') as HTMLElement;
        const addBtn = target.closest('.add-btn') as HTMLElement;

        if (viewBtn) {
          event.preventDefault();
          const customerData = JSON.parse(
            viewBtn.getAttribute('data-customer') || '{}'
          );
          onViewCustomer(customerData);
        }
        if (addBtn) {
          event.preventDefault();
          const customerData = JSON.parse(
            addBtn.getAttribute('data-customer') || '{}'
          );
          onAddProducts(customerData);
        }
      };

      const gridElement = gridRef.current;
      gridElement.addEventListener('click', handleClick);

      return () => {
        gridElement.removeEventListener('click', handleClick);
      };
    }
  }, [customers, onViewCustomer, onAddProducts]);

  return <div ref={gridRef}></div>;
};

export default CustomerTable;
