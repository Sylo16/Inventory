import React, { useMemo, useState } from "react";
import PageLayout from "../../components/PageLayout";
import Breadcrumb from "../../components/breadcrumbs";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useDamagedProducts } from "../../hooks/useDamagedProducts";
import AddDamagedRecordModal from "../../components/Inventory/AddDamagedRecordModal";
import EditDamagedRecordModal from "../../components/Inventory/EditDamagedRecordModal";
import { damagedProductsService, DamagedProduct } from "../../services/damagedProductsService";
import Swal from "sweetalert2";
import FilterDropdown from "../../components/FilterDropdown";
import {
	Package,
	Search,
	Filter,
	Plus,
	Users,
	ClipboardList,
	AlertTriangle,
	User,
	Edit,
	Trash2,
} from "lucide-react";

const DamagedProducts: React.FC = () => {
	const {
		enrichedRecords,
		selectedType,
		searchQuery,
		isLoading,
		totalRecords,
		adminCount,
		customerCount,
		adminTotalQty,
		customerTotalQty,
		handleSearchChange,
		handleTypeChange,
		fetchDamagedProducts,
		inventorySnapshot,
	} = useDamagedProducts();

	const inventoryIndex = useMemo(() => {
		const index = new Map<string, (typeof inventorySnapshot)[number]>();
		inventorySnapshot.forEach((item) => {
			index.set(item.name.toLowerCase(), item);
		});
		return index;
	}, [inventorySnapshot]);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<DamagedProduct | null>(null);
	
	// New Filter States
	const [selectedReason, setSelectedReason] = useState<string>("all");
	const [selectedAction, setSelectedAction] = useState<string>("all");

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		handleSearchChange(event.target.value);
	};

	const handleDelete = async (id: string) => {
		const result = await Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		});

		if (result.isConfirmed) {
			try {
				await damagedProductsService.deleteDamagedProduct(id);
				await fetchDamagedProducts();
				Swal.fire(
					'Deleted!',
					'The record has been deleted.',
					'success'
				);
			} catch (error) {
				console.error("Error deleting record:", error);
				Swal.fire(
					'Error!',
					'Failed to delete the record.',
					'error'
				);
			}
		}
	};

	const handleEdit = (product: DamagedProduct) => {
		setEditingRecord(product);
		setIsEditModalOpen(true);
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
		setEditingRecord(null);
	};

	// Filter products based on search and type
	const searchQueryLower = searchQuery.toLowerCase();
	const filteredProducts = enrichedRecords.filter(product => {
		const inventoryProduct = inventoryIndex.get(product.product_name.toLowerCase());
		const inventoryVariant = inventoryProduct?.variants?.find((variant) =>
			variant.unitLabel?.toLowerCase() === (product.unit_of_measurement || '').toLowerCase()
		);
		const variantSku = inventoryVariant?.sku;
		const matchesSearch = 
			product.product_name.toLowerCase().includes(searchQueryLower) ||
			(product.sku && product.sku.toLowerCase().includes(searchQueryLower)) ||
			(variantSku && variantSku.toLowerCase().includes(searchQueryLower)) ||
			product.customer_name.toLowerCase().includes(searchQueryLower);
		
		const isInternal = product.customer_name.includes("Admin") || product.customer_name.includes("Internal");
		
		// Apply Filters
		const matchesType = 
			selectedType === "all" ? true :
			selectedType === "admin" ? isInternal :
			!isInternal;

		const matchesReason = selectedReason === "all" || product.reason === selectedReason;
		const matchesAction = selectedAction === "all" || (product.action_taken || "Pending") === selectedAction;

		return matchesSearch && matchesType && matchesReason && matchesAction;
	});

	const totalQuantity = adminTotalQty + customerTotalQty;

	return (
		<PageLayout>
			<div className="space-y-6 animate-slideInUp">
				<Breadcrumb 
					title="Damaged Product Records" 
					links={[{ text: "Inventory", link: "/inventory" }]} 
					active="Damaged Products" 
				/>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-white p-4 rounded-xl shadow-sm">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-4xl font-bold text-slate-800">{totalRecords}</p>
								<p className="text-sm font-medium text-slate-500 mt-1">Total Records</p>
							</div>
							<div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
								<Package size={20} />
							</div>
						</div>
					</div>

					<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-4xl font-bold text-purple-600">{totalQuantity}</p>
								<p className="text-sm font-medium text-slate-500 mt-1">Total Quantity</p>
							</div>
							<div className="p-2 bg-purple-50 rounded-lg text-purple-600">
								<ClipboardList size={20} />
							</div>
						</div>
					</div>

					<div className="bg-white p-4 rounded-xl shadow-sm">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-4xl font-bold text-blue-600">{customerCount}</p>
								<p className="text-sm font-medium text-slate-500 mt-1">Customer Issues</p>
							</div>
							<div className="p-2 bg-blue-50 rounded-lg text-blue-600">
								<Users size={20} />
							</div>
						</div>
					</div>

					<div className="bg-white p-4 rounded-xl shadow-sm">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-4xl font-bold text-amber-600">{adminCount}</p>
								<p className="text-sm font-medium text-slate-500 mt-1">Internal Issues</p>
							</div>
							<div className="p-2 bg-amber-50 rounded-lg text-amber-600">
								<AlertTriangle size={20} />
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="bg-white rounded-xl shadow-lg">
					<div className="p-5 border-b border-slate-200 rounded-t-xl">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h2 className="text-lg font-bold text-slate-800">Damaged Product Records</h2>
								<p className="text-sm text-slate-500">Track and manage all logged product issues</p>
							</div>
							<button
								onClick={() => setIsModalOpen(true)}
								className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
							>
								<Plus size={18} />
								Add Record
							</button>
						</div>

						<div className="mt-6 flex flex-col md:flex-row gap-4">
							<div className="relative w-full md:w-96">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
								<input
									type="text"
									placeholder="Search product, SKU, or customer..."
									value={searchQuery}
									onChange={handleSearch}
									className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
								/>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{/* Type Filter */}
								<FilterDropdown
									value={selectedType}
									onChange={(val) => handleTypeChange(val as "all" | "customer" | "admin")}
									options={[
										{ value: "all", label: "All Types" },
										{ value: "customer", label: "Customer" },
										{ value: "admin", label: "Internal" },
									]}
									icon={<Filter size={16} className="text-slate-400" />}
									minWidth="w-40"
								/>

								{/* Reason Filter */}
								<FilterDropdown
									value={selectedReason}
									onChange={setSelectedReason}
									options={[
										{ value: "all", label: "All Reasons" },
										{ value: "Damaged from Delivery", label: "Damaged from Delivery" },
										{ value: "Defective Product", label: "Defective Product" },
										{ value: "Wrong Item", label: "Wrong Item" },
										{ value: "Near Expiration", label: "Near Expiration" },
										{ value: "Warehouse Damage", label: "Warehouse Damage" },
										{ value: "Other", label: "Other" },
									]}
									minWidth="w-56"
								/>

								{/* Action Filter */}
								<FilterDropdown
									value={selectedAction}
									onChange={setSelectedAction}
									options={[
										{ value: "all", label: "All Actions" },
										{ value: "Replacement", label: "Replacement" },
										{ value: "Refund Cash", label: "Refund Cash" },
										{ value: "Pending", label: "Pending" },
									]}
									minWidth="w-44"
								/>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto rounded-b-xl">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-200 divide-x divide-slate-200">
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Product</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Reason</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Action Taken</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Price</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Qty</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Customer</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Date</th>
									<th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200">
								{isLoading ? (
									<tr>
										<td colSpan={9} className="px-6 py-12 text-center text-slate-500">
											Loading records...
										</td>
									</tr>
								) : filteredProducts.length === 0 ? (
									<tr>
										<td colSpan={9} className="px-6 py-12 text-center text-slate-500">
											No records found matching your criteria.
										</td>
									</tr>
								) : (
									filteredProducts.map((product) => {
										const inventoryProduct = inventoryIndex.get(product.product_name.toLowerCase());
										const variantMatch = inventoryProduct?.variants?.find((variant) =>
											variant.unitLabel?.toLowerCase() === (product.unit_of_measurement || '').toLowerCase()
										);
										const variantLabel = product.unit_of_measurement || variantMatch?.unitLabel || '—';
										const productImage = product.image || inventoryProduct?.imageUrl;
										const displayDate = product.date || product.created_at;
										const formattedDate = displayDate
											? new Date(displayDate).toLocaleDateString('en-US', {
												day: '2-digit',
												month: 'short',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})
											: 'N/A';
										const isInternal = product.customer_name.includes("Admin") || product.customer_name.includes("Internal");
										
										return (
											<tr key={product.id} className="hover:bg-slate-50 transition-colors group divide-x divide-slate-200">
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
															{productImage ? (
																<img src={productImage} alt={product.product_name} className="w-full h-full object-cover" />
															) : (
																<Package size={20} className="text-slate-400" />
															)}
														</div>
														<div>
															<p className="text-sm font-bold text-slate-900">{product.product_name}</p>
															<p className="text-xs text-slate-500">{variantLabel}</p>
														</div>
													</div>
												</td>
												<td className="px-6 py-4">
													<p className="text-sm text-slate-700">{product.reason}</p>
												</td>
												<td className="px-6 py-4">
													{product.action_taken ? (
														<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
															{product.action_taken}
														</span>
													) : (
														<span className="text-sm text-slate-400">—</span>
													)}
												</td>
												<td className="px-6 py-4">
													<p className="text-sm text-slate-700">₱{product.unitPrice?.toLocaleString() || '0'}</p>
												</td>
												<td className="px-6 py-4">
													<span className="text-sm font-medium text-slate-700">
														{product.quantity}
													</span>
												</td>
												<td className="px-6 py-4">
													<span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
														isInternal 
															? 'bg-purple-50 text-purple-700' 
															: 'bg-blue-50 text-blue-700'
													}`}>
														{isInternal ? 'Internal' : 'Customer'}
													</span>
												</td>
												<td className="px-6 py-4">
													{isInternal ? (
														<div className="flex items-center gap-2">
															<div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
																<User size={12} className="text-slate-500" />
															</div>
															<span className="text-sm font-medium text-slate-700">Admin</span>
														</div>
													) : (
														<div className="flex items-center gap-2">
															<div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
																<User size={12} className="text-indigo-600" />
															</div>
															<span className="text-sm font-medium text-slate-700">{product.customer_name}</span>
														</div>
													)}
												</td>
												<td className="px-6 py-4">
													<span className="text-sm text-slate-500">{formattedDate}</span>
												</td>
												<td className="px-6 py-4 text-center">
													<div className="flex items-center justify-center gap-2">
														<button 
															onClick={() => handleEdit(product)}
															className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
															title="Edit"
														>
															<Edit size={16} />
														</button>
														<button 
															onClick={() => handleDelete(product.id!)}
															className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
															title="Delete"
														>
															<Trash2 size={16} />
														</button>
													</div>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<AddDamagedRecordModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={fetchDamagedProducts}
			/>
			<EditDamagedRecordModal
				isOpen={isEditModalOpen}
				record={editingRecord}
				onClose={handleCloseEditModal}
				onSuccess={fetchDamagedProducts}
			/>
			<ScrollToTopButton />
		</PageLayout>
	);
};

export default DamagedProducts;
