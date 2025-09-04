import React, { useState, useEffect } from 'react';
import { SearchFilters as Filters } from '../services/searchService';
import { searchService } from '../services/searchService';
import './SearchFilters.css';

interface SearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  aggregations?: {
    categories: Array<{ key: string; doc_count: number }>;
    brands: Array<{ key: string; doc_count: number }>;
    price_ranges: Array<{ key: string; doc_count: number; from?: number; to?: number }>;
    availability: Array<{ key: string; doc_count: number }>;
  };
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  aggregations
}) => {
  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    availabilityOptions: [] as string[]
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filterOptions = await searchService.getFilters();
        setAvailableFilters(filterOptions);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    
    loadFilters();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const newPriceRange = {
      ...filters.priceRange,
      [type]: numValue
    };
    handleFilterChange('priceRange', newPriceRange);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof Filters];
    if (key === 'priceRange') {
      const priceRange = value as { min?: number; max?: number } | undefined;
      return priceRange && (priceRange.min !== undefined || priceRange.max !== undefined);
    }
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3 className="filters-title">Filters</h3>
        <div className="filters-actions">
          {hasActiveFilters && (
            <button 
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear All
            </button>
          )}
          <button 
            className="toggle-filters-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      <div className={`filters-content ${isExpanded ? 'expanded' : ''}`}>
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {(aggregations?.categories || availableFilters.categories).map((item) => {
              const category = typeof item === 'string' ? item : item.key;
              const count = typeof item === 'string' ? null : item.doc_count;
              return (
                <option key={category} value={category}>
                  {category} {count && `(${count})`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="filter-group">
          <label className="filter-label">Brand</label>
          <select
            value={filters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {(aggregations?.brands || availableFilters.brands).map((item) => {
              const brand = typeof item === 'string' ? item : item.key;
              const count = typeof item === 'string' ? null : item.doc_count;
              return (
                <option key={brand} value={brand}>
                  {brand} {count && `(${count})`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <div className="price-range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.min || ''}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              className="price-input"
              min="0"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.max || ''}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="price-input"
              min="0"
            />
          </div>
          
          {/* Quick price range buttons */}
          <div className="price-quick-select">
            {aggregations?.price_ranges?.map((range) => (
              <button
                key={range.key}
                className="price-quick-btn"
                onClick={() => handleFilterChange('priceRange', { 
                  min: range.from, 
                  max: range.to 
                })}
              >
                {range.key} ({range.doc_count})
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-group">
          <label className="filter-label">Minimum Rating</label>
          <select
            value={filters.rating || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="filter-select"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div className="filter-group">
          <label className="filter-label">Availability</label>
          <select
            value={filters.availability || ''}
            onChange={(e) => handleFilterChange('availability', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">All Availability</option>
            {(aggregations?.availability || availableFilters.availabilityOptions).map((item) => {
              const availability = typeof item === 'string' ? item : item.key;
              const count = typeof item === 'string' ? null : item.doc_count;
              return (
                <option key={availability} value={availability}>
                  {availability} {count && `(${count})`}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersComponent;
