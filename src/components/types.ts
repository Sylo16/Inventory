
export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  unit_of_measurement: string;
  quantity: number;
  unit_price: string;
};

export type ProductEntry = {
  productName: string;
  category: string;
  unit: string;
  quantity: string;
};
