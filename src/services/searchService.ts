import axios from 'axios';

const OPENSEARCH_URL = 'http://localhost:4000/api';
const INDEX_NAME = 'products';

export interface SearchFilters {
  category?: string;
  brand?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  availability?: string;
  tags?: string[];
}

export interface SearchParams {
  query: string;
  filters?: SearchFilters;
  from?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  currency: string;
  rating: number;
  reviews_count: number;
  availability: string;
  specifications: Record<string, any>;
  tags: string[];
  image_url: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
  took: number;
  aggregations?: {
    categories: Array<{ key: string; doc_count: number }>;
    brands: Array<{ key: string; doc_count: number }>;
    price_ranges: Array<{ key: string; doc_count: number; from?: number; to?: number }>;
    availability: Array<{ key: string; doc_count: number }>;
  };
}

class SearchService {
  private buildSearchQuery(params: SearchParams) {
    const { query, filters, from = 0, size = 20, sortBy, sortOrder } = params;
    
    // Base query structure
    const searchBody: any = {
      from,
      size,
      query: {
        bool: {
          must: [],
          filter: []
        }
      },
      aggs: {
        categories: {
          terms: { field: 'category', size: 20 }
        },
        brands: {
          terms: { field: 'brand', size: 20 }
        },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { key: '0-100', from: 0, to: 100 },
              { key: '100-500', from: 100, to: 500 },
              { key: '500-1000', from: 500, to: 1000 },
              { key: '1000-2000', from: 1000, to: 2000 },
              { key: '2000+', from: 2000 }
            ]
          }
        },
        availability: {
          terms: { field: 'availability', size: 10 }
        }
      }
    };

    // Add main search query
    if (query && query.trim()) {
      searchBody.query.bool.must.push({
        multi_match: {
          query: query.trim(),
          fields: [
            'name^3',           // Boost name matches
            'description^2',    // Boost description matches
            'brand^2',         // Boost brand matches
            'category',
            'subcategory',
            'tags^1.5',        // Boost tag matches
            'specifications.*'  // Search in specifications
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    } else {
      // If no query, match all documents
      searchBody.query.bool.must.push({
        match_all: {}
      });
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        searchBody.query.bool.filter.push({
          term: { category: filters.category }
        });
      }

      if (filters.brand) {
        searchBody.query.bool.filter.push({
          term: { brand: filters.brand }
        });
      }

      if (filters.priceRange) {
        const priceFilter: any = { range: { price: {} } };
        if (filters.priceRange.min !== undefined) {
          priceFilter.range.price.gte = filters.priceRange.min;
        }
        if (filters.priceRange.max !== undefined) {
          priceFilter.range.price.lte = filters.priceRange.max;
        }
        searchBody.query.bool.filter.push(priceFilter);
      }

      if (filters.rating !== undefined) {
        searchBody.query.bool.filter.push({
          range: { rating: { gte: filters.rating } }
        });
      }

      if (filters.availability) {
        searchBody.query.bool.filter.push({
          term: { availability: filters.availability }
        });
      }

      if (filters.tags && filters.tags.length > 0) {
        searchBody.query.bool.filter.push({
          terms: { tags: filters.tags }
        });
      }
    }

    // Add sorting
    if (sortBy) {
      const sortField = sortBy === 'price' ? 'price' : 
                       sortBy === 'rating' ? 'rating' :
                       sortBy === 'name' ? 'name.keyword' :
                       '_score';
      
      searchBody.sort = [{
        [sortField]: {
          order: sortOrder || 'desc'
        }
      }];
      
      // Add secondary sort by score if not sorting by relevance
      if (sortField !== '_score') {
        searchBody.sort.push({ _score: { order: 'desc' } });
      }
    } else {
      // Default sort by relevance
      searchBody.sort = [{ _score: { order: 'desc' } }];
    }

    return searchBody;
  }

  async search(params: SearchParams): Promise<SearchResult> {
    try {
      const searchBody = this.buildSearchQuery(params);
      
      const response = await axios.post(
        `${OPENSEARCH_URL}/${INDEX_NAME}/_search`,
        searchBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      
      // Transform the response
      const products: Product[] = data.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score
      }));

      const aggregations = data.aggregations ? {
        categories: data.aggregations.categories.buckets,
        brands: data.aggregations.brands.buckets,
        price_ranges: data.aggregations.price_ranges.buckets,
        availability: data.aggregations.availability.buckets
      } : undefined;

      return {
        products,
        total: data.hits.total.value,
        took: data.took,
        aggregations
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform search');
    }
  }

  async getFilters(): Promise<{
    categories: string[];
    brands: string[];
    availabilityOptions: string[];
  }> {
    try {
      const response = await axios.post(
        `${OPENSEARCH_URL}/${INDEX_NAME}/_search`,
        {
          size: 0,
          aggs: {
            categories: {
              terms: { field: 'category', size: 100 }
            },
            brands: {
              terms: { field: 'brand', size: 100 }
            },
            availability: {
              terms: { field: 'availability', size: 100 }
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const aggs = response.data.aggregations;
      
      return {
        categories: aggs.categories.buckets.map((bucket: any) => bucket.key),
        brands: aggs.brands.buckets.map((bucket: any) => bucket.key),
        availabilityOptions: aggs.availability.buckets.map((bucket: any) => bucket.key)
      };
    } catch (error) {
      console.error('Error fetching filters:', error);
      return {
        categories: [],
        brands: [],
        availabilityOptions: []
      };
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await axios.get(`${OPENSEARCH_URL}/${INDEX_NAME}/_doc/${id}`);
      return response.data._source;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const response = await axios.post(
        `${OPENSEARCH_URL}/${INDEX_NAME}/_search`,
        {
          size: 0,
          suggest: {
            product_suggest: {
              text: query,
              term: {
                field: 'name',
                size: 5
              }
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestions = response.data.suggest?.product_suggest?.[0]?.options || [];
      return suggestions.map((suggestion: any) => suggestion.text);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
