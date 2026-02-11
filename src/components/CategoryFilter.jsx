import React, { useEffect, useRef, useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'category1', label: 'Safety' },
  { value: 'category2', label: 'Quality' },
  { value: 'category3', label: 'Warehousing' },
  { value: 'category4', label: 'HR' },
  { value: 'category5', label: 'Production' },
  { value: 'category6', label: 'All' },
];

const CategoryFilter = ({ selectedCategories, onChange, className = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (catValue) => {
    // If "All" selected → clear others and keep only All
    if (catValue === 'category6') {
      onChange(['category6']);
      return;
    }

    const withoutAll = selectedCategories.filter((c) => c !== 'category6');

    let next;
    if (withoutAll.includes(catValue)) {
      next = withoutAll.filter((c) => c !== catValue);
    } else {
      next = [...withoutAll, catValue];
    }

    onChange(next);
  };

  const clearCategories = () => {
    onChange([]);
  };

  return (
    <div className={`store-filter ${className}`} ref={dropdownRef}>
      <div
        className={`category-select-box ${showDropdown ? 'open' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span>Category</span>
        <span className="dropdown-icon">▼</span>
      </div>

      {showDropdown && (
        <div className="category-dropdown">
          {CATEGORY_OPTIONS.map((cat) => (
            <label key={cat.value} className="category-option">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
              />
              {cat.label}
            </label>
          ))}

          <div className="category-dropdown-actions">
            <button
              type="button"
              className="category-btn clear"
              onClick={clearCategories}
            >
              Clear
            </button>

            <button
              type="button"
              className="category-btn done"
              onClick={() => setShowDropdown(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;

