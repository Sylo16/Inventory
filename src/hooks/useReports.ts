import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  reportsService, 
  ReportData, 
  SalesReport, 
  DamagedProduct, 
  Customer,
  ActiveTab,
  TimeFilter,
  StockStatusFilter
} from '../services/reportsService';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export const useReports = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inventory");
  const [inventoryData, setInventoryData] = useState<ReportData[]>([]);
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [damagedData, setDamagedData] = useState<DamagedProduct[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [reportTitle, setReportTitle] = useState("Inventory Report");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<StockStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "inventory" || activeTab === "newProducts") {
          const data = await reportsService.fetchInventoryData();
          setInventoryData(data);
        } else if (activeTab === "sales") {
          const data = await reportsService.fetchSalesData();
          setSalesData(data);
        } else if (activeTab === "damaged") {
          const data = await reportsService.fetchDamagedData();
          setDamagedData(data);
        } else if (activeTab === "newCustomers") {
          const data = await reportsService.fetchCustomersData();
          setCustomersData(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load ${activeTab} data`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Filter inventory data
  const filteredInventoryData = reportsService.filterByTime(
    inventoryData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
      const matchesStockStatus = 
        stockStatusFilter === "all" || 
        reportsService.getStockStatus(item.quantity) === stockStatusFilter;
      
      return !item.hidden && matchesCategory && matchesStockStatus && matchesSearch;
    }),
    timeFilter
  );

  // Filter sales data
  const filteredSalesData = reportsService.filterByTime(
    salesData.filter(sale => {
      const saleDate = new Date(sale.purchaseDate);
      const startDate = dateRange.start;
      const endDate = dateRange.end;
      
      const matchesSearch = 
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sale.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "" || sale.productName.includes(categoryFilter);
      const matchesDateRange = 
        (!startDate || saleDate >= startDate) &&
        (!endDate || saleDate <= endDate);
      
      return matchesCategory && matchesDateRange && matchesSearch;
    }),
    timeFilter
  );

  // Filter damaged data
  const filteredDamagedData = reportsService.filterByTime(
    damagedData.filter(item => {
      const damageDate = new Date(item.date);
      const startDate = dateRange.start;
      const endDate = dateRange.end;
      
      const matchesSearch = 
        item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "" || item.product_name.includes(categoryFilter);
      const matchesDateRange = 
        (!startDate || damageDate >= startDate) &&
        (!endDate || damageDate <= endDate);
      
      return matchesCategory && matchesDateRange && matchesSearch;
    }),
    timeFilter
  );

  // Filter new customers
  const filteredNewCustomers = reportsService.filterByTime(
    customersData.filter(customer => {
      return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             customer.phone.toLowerCase().includes(searchQuery.toLowerCase());
    }),
    timeFilter
  );

  // Filter new products
  const filteredNewProducts = reportsService.filterByTime(
    inventoryData.filter(item => {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    }),
    timeFilter
  );

  // Get categories
  const categories = reportsService.getCategories(activeTab, inventoryData, salesData, damagedData);

  // Get stock status counts
  const stockStatusCounts = reportsService.getStockStatusCounts(inventoryData);

  // Calculate metrics
  const inventoryValue = reportsService.calculateInventoryValue(filteredInventoryData);
  const totalSales = reportsService.calculateTotalSales(filteredSalesData);
  const totalDamaged = reportsService.calculateTotalDamaged(filteredDamagedData);
  const groupedDamaged = reportsService.groupDamagedByCustomer(filteredDamagedData);
  const aggregatedDamaged = reportsService.aggregateDamagedProducts(filteredDamagedData);

  // Generate PDF
  const generatePDF = () => {
    const input = document.getElementById("report-content");
    if (!input) return;

    setLoading(true);
    
    html2canvas(input, {
      scale: 2,
      logging: true,
      useCORS: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportTitle.replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
      setLoading(false);
    }).catch(error => {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      setLoading(false);
    });
  };

  // Handle tab change
  const handleTabChange = (tab: ActiveTab, title: string) => {
    setActiveTab(tab);
    setReportTitle(title);
  };

  // Get time filter label
  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      default: return "All Time";
    }
  };

  return {
    // State
    activeTab,
    loading,
    dateRange,
    timeFilter,
    reportTitle,
    categoryFilter,
    stockStatusFilter,
    searchQuery,
    
    // Data
    inventoryData,
    salesData,
    damagedData,
    customersData,
    
    // Filtered Data
    filteredInventoryData,
    filteredSalesData,
    filteredDamagedData,
    filteredNewCustomers,
    filteredNewProducts,
    
    // Computed Values
    categories,
    stockStatusCounts,
    inventoryValue,
    totalSales,
    totalDamaged,
    groupedDamaged,
    aggregatedDamaged,
    
    // Setters
    setDateRange,
    setTimeFilter,
    setCategoryFilter,
    setStockStatusFilter,
    setSearchQuery,
    
    // Handlers
    handleTabChange,
    generatePDF,
    getTimeFilterLabel,
    getStockStatus: reportsService.getStockStatus,
  };
};
