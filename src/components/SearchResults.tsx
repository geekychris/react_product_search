import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProductCard from './ProductCard';
import { Product, SearchParams, SearchResult } from '../services/searchService';
import { searchService } from '../services/searchService';
import './SearchResults.css';

interface SearchResultsProps {
  searchParams: SearchParams;
  onAggregationsUpdate?: (aggregations: SearchResult['aggregations']) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchParams, 
  onAggregationsUpdate 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const pageSize = 12;

  // Reset when search parameters change
  useEffect(() => {
    setProducts([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    performSearch(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.query, searchParams.filters, sortBy, sortOrder]);

  const performSearch = async (page: number, reset: boolean = false) => {
    if (loading && !reset) return;

    setLoading(true);
    setError(null);

    try {
      const searchResult = await searchService.search({
        ...searchParams,
        from: page * pageSize,
        size: pageSize,
        sortBy: sortBy === 'relevance' ? undefined : sortBy,
        sortOrder
      });

      if (reset) {
        setProducts(searchResult.products);
      } else {
        setProducts(prev => [...prev, ...searchResult.products]);
      }

      setTotal(searchResult.total);
      setHasMore(searchResult.products.length === pageSize && (page + 1) * pageSize < searchResult.total);
      setCurrentPage(page);

      // Update aggregations for filters
      if (onAggregationsUpdate && searchResult.aggregations) {
        onAggregationsUpdate(searchResult.aggregations);
      }
    } catch (err) {
      setError('Failed to load search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      performSearch(currentPage + 1);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      // Set default order for different fields
      setSortOrder(newSortBy === 'price' ? 'asc' : 'desc');
    }
  };

  const renderSortOptions = () => (
    <div className="sort-controls">
      <label className="sort-label">Sort by:</label>
      <div className="sort-buttons">
        <button
          className={`sort-btn ${sortBy === 'relevance' ? 'active' : ''}`}
          onClick={() => handleSortChange('relevance')}
        >
          Relevance
        </button>
        <button
          className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
          onClick={() => handleSortChange('price')}
        >
          Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
          onClick={() => handleSortChange('rating')}
        >
          Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
          onClick={() => handleSortChange('name')}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>
    </div>
  );

  const renderResultsHeader = () => (
    <div className="results-header">
      <div className="results-info">
        <h2 className="results-title">
          {searchParams.query ? `Results for "${searchParams.query}"` : 'All Products'}
        </h2>
        <p className="results-count">
          {loading && products.length === 0 ? 'Loading...' : `${total.toLocaleString()} products found`}
        </p>
      </div>
      {renderSortOptions()}
    </div>
  );

  const renderLoader = () => (
    <div className="loader">
      <div className="loader-spinner"></div>
      <p>Loading more products...</p>
    </div>
  );

  const renderError = () => (
    <div className="error-message">
      <p>{error}</p>
      <button 
        className="retry-btn"
        onClick={() => performSearch(currentPage, true)}
      >
        Try Again
      </button>
    </div>
  );

  const renderNoResults = () => (
    <div className="no-results">
      <div className="no-results-icon">🔍</div>
      <h3>No products found</h3>
      <p>Try adjusting your search terms or filters</p>
    </div>
  );

  if (error && products.length === 0) {
    return (
      <div className="search-results">
        {renderResultsHeader()}
        {renderError()}
      </div>
    );
  }

  return (
    <div className="search-results">
      {renderResultsHeader()}

      {products.length === 0 && !loading ? (
        renderNoResults()
      ) : (
        <InfiniteScroll
          dataLength={products.length}
          next={loadMore}
          hasMore={hasMore}
          loader={renderLoader()}
          endMessage={
            <div className="end-message">
              <p>You've seen all {total} products!</p>
            </div>
          }
          scrollThreshold={0.8}
          className="infinite-scroll-container"
        >
          <div className="products-grid">
            {products.map((product, index) => (
              <ProductCard 
                key={`${product.id}-${index}`} 
                product={product}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}

      {/* Loading overlay for initial search */}
      {loading && products.length === 0 && (
        <div className="initial-loading">
          <div className="loader-spinner large"></div>
          <p>Searching products...</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
