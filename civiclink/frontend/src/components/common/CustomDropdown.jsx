import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Droplets, Trash2, Zap, AlertCircle, CheckCircle, Clock, List } from 'lucide-react';

const categoryIcons = {
  '':            <List size={14}/>,
  'pothole':     <AlertCircle size={14}/>,
  'water':       <Droplets size={14}/>,
  'garbage':     <Trash2 size={14}/>,
  'electricity': <Zap size={14}/>,
  'other':       <AlertCircle size={14}/>,
};

const statusIcons = {
  '':            <List size={14}/>,
  'pending':     <Clock size={14}/>,
  'in_progress': <AlertCircle size={14}/>,
  'resolved':    <CheckCircle size={14}/>,
};

const statusColors = {
  '':            'text-gray-500',
  'pending':     'text-yellow-500',
  'in_progress': 'text-blue-500',
  'resolved':    'text-green-500',
};

const CustomDropdown = ({ options, value, onChange, type = 'category' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const icons = type === 'category' ? categoryIcons : statusIcons;
  const colors = type === 'status' ? statusColors : {};

  const selectedLabel = options.find(o => o.value === value)?.label || options[0]?.label;
  const selectedIcon = icons[value] || icons[''];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 min-w-[130px] justify-between shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          <span className={colors[value] || 'text-gray-400'}>{selectedIcon}</span>
          <span className="capitalize">{selectedLabel}</span>
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}/>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 py-1.5">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                ${value === opt.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <span className={value === opt.value ? 'text-blue-500' : (colors[opt.value] || 'text-gray-400')}>
                {icons[opt.value] || icons['']}
              </span>
              <span className="capitalize">{opt.label}</span>
              {value === opt.value && (
                <CheckCircle size={12} className="ml-auto text-blue-500"/>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;