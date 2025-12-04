import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FilterOption {
	value: string;
	label: string;
}

interface FilterDropdownProps {
	value: string;
	onChange: (value: string) => void;
	options: FilterOption[];
	icon?: React.ReactNode;
	minWidth?: string;
	className?: string;
    placeholder?: string;
    disabled?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
    value, 
    onChange, 
    options, 
    icon, 
    minWidth = "w-48",
    className = "",
    placeholder = "Select",
    disabled = false
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			<button
                type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
				className={`flex items-center justify-between w-full gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-all
                    ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'}
                `}
			>
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="truncate">{selectedLabel}</span>
                </div>
				<ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
			</button>

			{isOpen && (
				<div className={`absolute right-0 z-50 mt-2 ${minWidth} bg-white rounded-lg shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto`}>
					{options.map((option) => (
						<button
                            type="button"
							key={option.value}
							onClick={() => {
								onChange(option.value);
								setIsOpen(false);
							}}
							className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
								value === option.value ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-slate-700'
							}`}
						>
							{option.label}
							{value === option.value && <Check size={14} />}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default FilterDropdown;
