import React, { useMemo, useState } from "react";
import {
    Settings2,
    Archive,
    ArchiveRestore,
    Maximize2,
    Package,
    Plus,
    Minus,
    Layers,
    Clock,
} from "lucide-react";
import { Product, ProductVariant } from "../../services/inventoryService";
import FilterDropdown from "../FilterDropdown";

interface LoadingStates {
    receive: Record<string, boolean>;
    deduct: Record<string, boolean>;
    hide: Record<string, boolean>;
    edit: Record<string, boolean>;
    unhide: Record<string, boolean>;
}

interface ProductCardProps {
    item: Product;
    quantities: Record<string, number>;
    refundQuantities: Record<string, number>;
    loadingStates: LoadingStates;
    activeVariant?: ProductVariant;
    onQuantityChange: (productId: string, value: string) => void;
    onRefundQuantityChange: (productId: string, value: string) => void;
    onReceiveProduct: (productId: string) => void;
    onRefundProduct: (productId: string) => void;
    onUpdateProduct: (productId: string) => void;
    onHideProduct: (productId: string) => void;
    onUnhideProduct: (productId: string) => void;
    onImageClick?: (imageUrl: string, productName: string) => void;
    onVariantChange?: (productId: string, variantId: string) => void;
}

const resolveStatusBadge = (hidden: boolean, quantity: number) => {
    if (hidden) {
        // Light gray for archived to distinguish from "Dark" Out of Stock
        return { text: "Archived", classes: "bg-slate-100 text-slate-500 ring-1 ring-slate-200" };
    }
    if (quantity <= 0) {
        // Dark for Out of Stock
        return { text: "Out of stock", classes: "bg-slate-900 text-white ring-1 ring-slate-900" };
    }
    if (quantity <= 10) {
        // Red for Critical Stock (1-10)
        return { text: "Critical Stock", classes: "bg-white text-red-600 ring-1 ring-red-200" };
    }
    if (quantity <= 20) {
        // Yellow for Low Stock (11-20)
        return { text: "Low stock", classes: "bg-white text-amber-500 ring-1 ring-amber-200" };
    }
    // Green for In Stock (>20)
    return { text: "In stock", classes: "bg-white text-emerald-600 ring-1 ring-emerald-200" };
};

const ProductCard: React.FC<ProductCardProps> = ({
    item,
    quantities,
    refundQuantities,
    loadingStates,
    activeVariant,
    onQuantityChange,
    onRefundQuantityChange,
    onReceiveProduct,
    onRefundProduct,
    onUpdateProduct,
    onHideProduct,
    onUnhideProduct,
    onImageClick,
    onVariantChange,
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageErrored, setImageErrored] = useState(false);

    const currentVariant = useMemo(() => {
        if (!item.hasVariants || item.variants.length === 0) {
            return undefined;
        }

        if (activeVariant) {
            const match = item.variants.find((variant) => variant.id === activeVariant.id);
            if (match) {
                return match;
            }
        }

        return item.variants.find((variant) => variant.isDefault) ?? item.variants[0];
    }, [item, activeVariant]);

    const displayedPrice = currentVariant?.unitPrice ?? item.unitPrice;
    const displayedQuantity = currentVariant?.quantity ?? item.quantity;
    const displayedUnit = currentVariant?.unitLabel ?? item.unitOfMeasurement;
    const stockBadge = resolveStatusBadge(item.hidden, displayedQuantity);

    const variantChoices = item.hasVariants ? item.variants.filter((variant) => !variant.hidden) : [];
    const restockValue = quantities[item.id] ?? "";
    const deductValue = refundQuantities[item.id] ?? "";
    const canInteract = !item.hidden;

    const handleVariantSelect = (variantId: string) => {
        if (!canInteract || !onVariantChange) return;
        onVariantChange(item.id, variantId);
    };

    return (
        <div className={`group relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 ${item.hidden ? "opacity-80 grayscale-[0.5]" : ""}`}>
            
            {/* Top Section: Image & Status */}
            <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-t-xl bg-slate-50 border-b border-slate-100">
                {/* Status Badges Overlay */}
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${stockBadge.classes}`}>
                        {stockBadge.text}
                    </span>
                </div>

                {item.imageUrl && !imageErrored ? (
                    <>
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className={`h-full w-full object-contain p-4 transition-all duration-500 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageErrored(true)}
                        />
                        {onImageClick && (
                            <button
                                type="button"
                                className="absolute bottom-3 right-3 p-1.5 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-100 opacity-0 transform translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 hover:text-blue-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onImageClick(item.imageUrl as string, item.name);
                                }}
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-slate-300">
                        <Package className="h-10 w-10 mb-2 opacity-50" />
                        <span className="text-xs font-medium">No Preview</span>
                    </div>
                )}
            </div>

            {/* Middle Section: Details */}
            <div className="flex flex-col flex-1 p-4 pb-2">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.category || "General"}
                    </span>
                    {item.updatedAt && (
                        <div className="flex items-center text-[10px] text-slate-400" title={`Updated: ${item.updatedAt}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {item.updatedAt.split(' ')[0]} 
                        </div>
                    )}
                </div>

                {/* Updated Typography: Big and Bold per previous request */}
                <h3 className="text-lg font-extrabold text-emerald-500 leading-tight line-clamp-2 min-h-[2.5em]" title={item.name}>
                    {item.name}
                </h3>

                <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">Price</span>
                        <span className="text-lg font-bold text-slate-900">₱{displayedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex flex-col items-end">
                         <span className="text-xs text-slate-500 font-medium">Stock</span>
                        <div className="flex items-center gap-1">
                            {/* Stock Color Logic for Text */}
                             <span className={`text-lg font-bold ${
                                 displayedQuantity <= 0 ? 'text-slate-900' : 
                                 displayedQuantity <= 10 ? 'text-red-600' : 
                                 displayedQuantity <= 20 ? 'text-amber-500' : 
                                 'text-emerald-600'
                             }`}>
                                {displayedQuantity}
                            </span>
                            <span className="text-xs text-slate-400 font-medium uppercase">{displayedUnit}</span>
                        </div>
                    </div>
                </div>

                {/* Variant Selector */}
                {item.hasVariants && variantChoices.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500">Select Variant</span>
                        </div>
                        <FilterDropdown
                            value={currentVariant?.id || ""}
                            onChange={(val) => handleVariantSelect(val)}
                            options={variantChoices.map((variant) => ({
                                value: variant.id,
                                label: `${variant.unitLabel} • ₱${variant.unitPrice.toFixed(2)}`
                            }))}
                            className="w-full"
                            minWidth="w-full"
                        />
                    </div>
                )}

                {/* Quick Actions - Input Groups */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    {/* Restock Group */}
                    <div className="flex items-stretch rounded-lg shadow-sm">
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={restockValue}
                            onChange={(e) => onQuantityChange(item.id, e.target.value)}
                            disabled={!canInteract || loadingStates.receive[item.id]}
                            className="w-full min-w-0 px-2 py-1.5 text-sm text-center font-medium border border-r-0 border-slate-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 disabled:bg-slate-50"
                        />
                        <button
                            type="button"
                            onClick={() => onReceiveProduct(item.id)}
                            disabled={!canInteract || loadingStates.receive[item.id] || !restockValue}
                            className={`flex items-center justify-center px-2 bg-emerald-600 text-white rounded-r-lg border border-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${loadingStates.receive[item.id] ? 'w-10' : ''}`}
                            title="Restock"
                        >
                            {loadingStates.receive[item.id] ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Deduct Group */}
                    <div className="flex items-stretch rounded-lg shadow-sm">
                        <input
                            type="number"
                            min="0"
                            max={displayedQuantity}
                            placeholder="0"
                            value={deductValue}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > displayedQuantity) {
                                    onRefundQuantityChange(item.id, displayedQuantity.toString());
                                } else {
                                    onRefundQuantityChange(item.id, e.target.value);
                                }
                            }}
                            disabled={!canInteract || loadingStates.deduct[item.id]}
                            className="w-full min-w-0 px-2 py-1.5 text-sm text-center font-medium border border-r-0 border-slate-200 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:z-10 disabled:bg-slate-50"
                        />
                        <button
                            type="button"
                            onClick={() => onRefundProduct(item.id)}
                            disabled={!canInteract || loadingStates.deduct[item.id] || !deductValue}
                            className={`flex items-center justify-center px-2 bg-slate-700 text-white rounded-r-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${loadingStates.deduct[item.id] ? 'w-10' : ''}`}
                            title="Deduct"
                        >
                            {loadingStates.deduct[item.id] ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                                <Minus className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-2 border-t border-slate-100 divide-x divide-slate-100">
                <button
                    type="button"
                    onClick={() => onUpdateProduct(item.id)}
                    disabled={!canInteract || loadingStates.edit[item.id]}
                    className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 rounded-bl-xl"
                >
                    <Settings2 className="w-3.5 h-3.5" />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => (item.hidden ? onUnhideProduct(item.id) : onHideProduct(item.id))}
                    disabled={item.hidden ? loadingStates.unhide[item.id] : loadingStates.hide[item.id]}
                    className={`flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors disabled:opacity-50 rounded-br-xl ${
                        item.hidden 
                        ? "text-amber-600 hover:bg-amber-50" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-rose-600"
                    }`}
                >
                    {item.hidden ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    {item.hidden ? "Restore" : "Archive"}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;