import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import SearchFilters from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import ScrollToTop from './components/ScrollToTop';
import { SearchFilters as Filters, SearchResult } from './services/searchService';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [aggregations, setAggregations] = useState<SearchResult['aggregations']>();

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleAggregationsUpdate = useCallback((newAggregations: SearchResult['aggregations']) => {
    setAggregations(newAggregations);
  }, []);

  const searchParams = {
    query,
    filters
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">🔍</span>
              Product Search
            </h1>
            <p className="app-subtitle">
              Discover amazing products with our powerful search engine
            </p>
          </div>
          <div className="search-section">
            <SearchBar 
              onSearch={handleSearch} 
              initialQuery={query}
              placeholder="Search for products, brands, categories..."
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="content-layout">
            <aside className="sidebar">
              <SearchFilters 
                filters={filters}
                onFiltersChange={handleFiltersChange}
                aggregations={aggregations}
              />
            </aside>
            
            <div className="main-content">
              <SearchResults 
                searchParams={searchParams}
                onAggregationsUpdate={handleAggregationsUpdate}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>© 2024 Product Search. Powered by OpenSearch and React.</p>
        </div>
      </footer>
      
      <ScrollToTop />
    </div>
  );
}

export default App;
