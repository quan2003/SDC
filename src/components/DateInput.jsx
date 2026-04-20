import { useState, useEffect, useRef } from 'react';
import { FiCalendar } from 'react-icons/fi';

export default function DateInput({ value, onChange, placeholder = "dd/mm/yyyy", className, ...props }) {
  const [internalValue, setInternalValue] = useState('');
  const dateInputRef = useRef(null);

  // Synchronize internal text value when external value changes
  useEffect(() => {
    if (!value) {
      setInternalValue('');
    } else if (typeof value === 'string' && value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        setInternalValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
      } else {
        setInternalValue(value);
      }
    } else {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e) => {
    const inputStr = e.target.value;
    
    // Handle backspace safely
    if (inputStr.length < internalValue.length) {
      setInternalValue(inputStr);
      onChange(inputStr);
      return;
    }

    // Auto-format digits to dd/mm/yyyy
    const digits = inputStr.replace(/\D/g, '');
    let formatted = digits;

    if (digits.length >= 2) {
      formatted = digits.substring(0, 2) + '/';
      if (digits.length >= 4) {
        formatted += digits.substring(2, 4) + '/';
        if (digits.length >= 8) {
          formatted += digits.substring(4, 8);
        } else {
          formatted += digits.substring(4);
        }
      } else {
        formatted += digits.substring(2);
      }
    }

    formatted = formatted.substring(0, 10);
    setInternalValue(formatted);

    // If valid length, emit yyyy-mm-dd
    if (formatted.length === 10) {
      const parts = formatted.split('/');
      onChange(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      onChange(formatted);
    }
  };

  const handleNativeChange = (e) => {
    const dVal = e.target.value; // yyyy-mm-dd
    if (dVal) {
      onChange(dVal);
    }
  };

  const openPicker = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (err) {
        // Fallback if browser doesn't support showPicker
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        className={className}
        value={internalValue}
        placeholder={placeholder}
        onChange={handleChange}
        maxLength={10}
        inputMode="numeric"
        style={{ paddingRight: 40, width: '100%' }}
        {...props}
      />
      
      <button 
        type="button"
        onClick={openPicker}
        style={{ 
          position: 'absolute', right: 10,
          background: 'transparent', border: 'none', padding: 4, 
          cursor: 'pointer', color: 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        tabIndex={-1}
      >
        <FiCalendar size={16} />
      </button>
      
      <input 
        type="date"
        ref={dateInputRef}
        value={value && value.includes('-') && value.split('-')[0].length === 4 ? value : ''}
        onChange={handleNativeChange}
        style={{ 
          position: 'absolute', width: 0, height: 0, opacity: 0, 
          border: 'none', padding: 0, margin: 0, pointerEvents: 'none'
        }}
        tabIndex={-1}
      />
    </div>
  );
}
