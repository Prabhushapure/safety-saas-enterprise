import React, { useEffect, useRef, useState } from 'react';

const API_BASE_URL = '/AWE-SaaS/api';

const CategoryFilter = ({ selectedCategories, onChange, className = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/games/categories`);
        const json = await res.json();

        if (json.success) {
          setCategories(json.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (catId) => {
    // Handle ALL
    if (catId === 'all') {
      onChange(['all']);
      return;
    }

    // Remove all if present
    const withoutAll = selectedCategories.filter((c) => c !== 'all');

    let next;
    if (withoutAll.includes(catId)) {
      next = withoutAll.filter((c) => c !== catId);
    } else {
      next = [...withoutAll, catId];
    }

    onChange(next);
  };

  const clearCategories = () => {
    onChange([]);
  };

  return (
    <>
      {showDropdown && (
        <div
          className="category-dropdown-backdrop"
          onClick={() => setShowDropdown(false)}
        />
      )}

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
            {/* ALL option */}
            <label className="category-option">
              <input
                type="checkbox"
                checked={selectedCategories.includes('all')}
                onChange={() => toggleCategory('all')}
              />
              All
            </label>

            {/* DB categories */}
            {categories.map((cat) => {
              const catId = Number(cat.id);

              return (
                <label key={catId} className="category-option">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(catId)}
                    onChange={() => toggleCategory(catId)}
                  />
                  {cat.category_name}
                </label>
              );
            })}

            <div className="category-dropdown-actions">
              <button
                type="button"
                className="category-btn clear"
                onClick={clearCategories}
              >
                Clear
              </button>

            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryFilter;
