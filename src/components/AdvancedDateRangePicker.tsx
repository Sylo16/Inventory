import React, { useState, useEffect, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import "react-day-picker/dist/style.css";
import { 
  format, 
  subWeeks, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  startOfQuarter, 
  endOfQuarter, 
  startOfDay, 
  endOfDay, 
  subHours
} from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';

interface AdvancedDateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (update: [Date | null, Date | null]) => void;
}

type Tab = 'period' | 'dates';
type PeriodType = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour';

const AdvancedDateRangePicker: React.FC<AdvancedDateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dates');
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [lastWeeks, setLastWeeks] = useState<number>(4);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onChange([tempStartDate, tempEndDate]);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handlePeriodSelect = (type: PeriodType) => {
    setPeriodType(type);
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (type) {
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'quarter':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'day':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'hour':
        start = subHours(now, 1);
        end = now;
        break;
    }

    if (start && end) {
      setTempStartDate(start);
      setTempEndDate(end);
    }
  };

  const handleLastWeeksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setLastWeeks(val);
      const end = new Date();
      const start = subWeeks(end, val);
      setTempStartDate(start);
      setTempEndDate(end);
    }
  };

  const handleWeekToDate = () => {
    const now = new Date();
    setTempStartDate(startOfWeek(now));
    setTempEndDate(now);
  };

  const handlePreviousWeek = () => {
    const now = new Date();
    const prevWeek = subWeeks(now, 1);
    setTempStartDate(startOfWeek(prevWeek));
    setTempEndDate(endOfWeek(prevWeek));
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Select Date Range';
    if (startDate && !endDate) return format(startDate, 'do MMM yyyy');
    if (startDate && endDate) return `${format(startDate, 'do MMM yyyy')} – ${format(endDate, 'do MMM yyyy')}`;
    return 'Select Date Range';
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      setTempStartDate(range.from);
      setTempEndDate(range.to || null);
    } else {
      setTempStartDate(null);
      setTempEndDate(null);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Input Trigger */}
      <div 
        className="flex items-center justify-between bg-white border border-slate-300 rounded-lg px-4 py-2.5 cursor-pointer hover:border-blue-500 transition-colors shadow-sm min-w-[280px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          <Calendar size={18} className="text-slate-400" />
          <span>{formatDateRange()}</span>
        </div>
        <ChevronDown size={16} className="text-slate-400" />
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl z-50 w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              className={`px-6 py-3 text-sm font-bold transition-colors relative ${activeTab === 'period' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('period')}
            >
              Specify Period
              {activeTab === 'period' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
            <button
              className={`px-6 py-3 text-sm font-bold transition-colors relative ${activeTab === 'dates' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('dates')}
            >
              Specify Dates
              {activeTab === 'dates' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'period' ? (
              <div className="space-y-6">
                {/* Period Types */}
                <div className="flex rounded-lg overflow-hidden">
                  {['Year', 'Quarter', 'Month', 'Week', 'Day', 'Hour'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePeriodSelect(type.toLowerCase() as PeriodType)}
                      className={`flex-1 py-2 text-sm font-medium border-r border-slate-200 last:border-r-0 transition-colors ${
                        periodType === type.toLowerCase() 
                          ? 'bg-white text-blue-600 shadow-inner' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                      style={{ boxShadow: periodType === type.toLowerCase() ? 'inset 0 -2px 0 0 #2563eb' : 'none' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={handleWeekToDate}>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-400 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                    </div>
                    <span className="text-slate-700 font-medium">Week to date</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group" onClick={handlePreviousWeek}>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-400 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                    </div>
                    <span className="text-slate-700 font-medium">Previous week</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${true ? 'border-blue-600' : 'border-slate-300'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${true ? 'bg-blue-600' : 'bg-transparent'}`} />
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <span>Last</span>
                      <input 
                        type="number" 
                        value={lastWeeks}
                        onChange={handleLastWeeksChange}
                        className="w-12 px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:border-blue-500"
                      />
                      <span>weeks</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex gap-6">
                {/* Date Inputs */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From:</label>
                      <input 
                        type="text" 
                        value={tempStartDate ? format(tempStartDate, 'yyyy-MM-dd') : ''}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To:</label>
                      <input 
                        type="text" 
                        value={tempEndDate ? format(tempEndDate, 'yyyy-MM-dd') : ''}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="custom-datepicker-wrapper rounded-xl overflow-hidden p-4 flex justify-center bg-white">
                    <style>{`
                      .rdp {
                        --rdp-cell-size: 30px;
                        --rdp-caption-font-size: 14px;
                        margin: 0;
                      }
                      .rdp-months {
                        display: flex;
                        flex-direction: row;
                        gap: 1rem;
                      }
                      .rdp-month {
                        margin: 0;
                      }
                      .rdp-caption {
                        padding: 0 0 0.5rem 0;
                      }
                      .rdp-head_cell {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #64748b;
                      }
                      .rdp-day {
                        font-size: 0.875rem;
                      }
                      .rdp-nav_button {
                        width: 24px;
                        height: 24px;
                      }
                    `}</style>
                    <DayPicker
                      mode="range"
                      selected={{
                        from: tempStartDate || undefined,
                        to: tempEndDate || undefined
                      }}
                      onSelect={handleRangeSelect}
                      numberOfMonths={2}
                      defaultMonth={tempStartDate || new Date()}
                      modifiersClassNames={{
                        selected: 'bg-blue-600 text-white hover:bg-blue-600',
                        range_start: 'bg-blue-600 text-white rounded-l-md',
                        range_end: 'bg-blue-600 text-white rounded-r-md',
                        range_middle: 'bg-blue-50 text-blue-900',
                        today: 'text-blue-600 font-bold'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <div className="text-sm font-medium text-slate-600">
              {tempStartDate && tempEndDate ? (
                <span>
                  {format(tempStartDate, 'do MMM yyyy')} – {format(tempEndDate, 'do MMM yyyy')}
                </span>
              ) : (
                <span>Select a range</span>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleApply}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDateRangePicker;
