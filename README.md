# OpenSearch React UI

A modern, production-ready React-based search interface for exploring products using OpenSearch. This application provides a comprehensive search experience with features like intelligent search, auto-complete suggestions, advanced filtering, infinite scroll, and responsive design.

## Features

- **Intelligent Search**: Multi-field search with relevance scoring and fuzzy matching
- **Auto-complete Suggestions**: Real-time search suggestions as you type
- **Advanced Filtering**: Dynamic filters for category, brand, price range, rating, and availability
- **Infinite Scroll**: Seamless browsing with automatic content loading
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Aggregations**: Filter counts update dynamically based on search results
- **Multiple Sort Options**: Sort by relevance, price, rating, or name
- **Modern UI/UX**: Clean interface with smooth animations and loading states
- **CORS-enabled Proxy**: Secure API proxy server for OpenSearch communication
- **TypeScript Support**: Fully typed for better development experience

## Architecture Overview

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **Search Engine**: OpenSearch 3.2+
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Styling**: CSS Modules with modern CSS features
- **Build Tool**: Create React App
- **Proxy Server**: Express.js with CORS support

### Component Architecture

```
src/
├── components/           # Reusable UI components
│   ├── SearchBar.tsx       # Search input with autocomplete
│   ├── SearchFilters.tsx   # Filter sidebar with aggregations
│   ├── SearchResults.tsx   # Results display with infinite scroll
│   └── ProductCard.tsx     # Individual product display
├── services/             # API and business logic
│   └── searchService.ts    # OpenSearch integration
└── App.tsx               # Main application component
```

### Data Flow
1. **User Input** → SearchBar component captures search queries
2. **State Management** → App.tsx manages global search state
3. **API Calls** → searchService.ts communicates with OpenSearch via proxy
4. **Results Display** → SearchResults renders products with infinite scroll
5. **Filter Updates** → SearchFilters updates based on search aggregations

## Prerequisites

- **Node.js**: Version 16 or higher
- **OpenSearch**: Version 3.0+ running on `localhost:30920`
- **npm**: For package management

## Installation & Setup

### 1. Clone and Navigate
```bash
cd opensearch-ui
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure OpenSearch Connection
By default, the application connects to OpenSearch on `localhost:30920`. To change this:

**Option A: Environment Variable**
```bash
export OPENSEARCH_URL=http://localhost:9200
```

**Option B: Update Configuration Files**
- `server/index.js`: Update the `TARGET` variable
- `scripts/index-products.js`: Update the client configuration

### 4. Start OpenSearch
Ensure OpenSearch is running and accessible:
```bash
curl http://localhost:30920/_cluster/health
```

### 5. Create and Index Catalog
```bash
npm run index-data
```

### 6. Start the Application

**Development Mode (with proxy):**
```bash
# Terminal 1: Start the proxy server
npm run server

# Terminal 2: Start the React app
npm start
```

The application will be available at:
- React App: `http://localhost:3000` or `http://localhost:3001`
- Proxy Server: `http://localhost:4000`

## Project Structure

```
opensearch-ui/
├── public/                 # Public assets
├── src/
│   ├── components/        # React components
│   │   ├── SearchBar.tsx     # Search input with auto-complete
│   │   ├── SearchFilters.tsx # Filter sidebar
│   │   ├── SearchResults.tsx # Results with infinite scroll
│   │   └── ProductCard.tsx   # Individual product display
│   ├── services/         # API services
│   │   └── searchService.ts  # OpenSearch integration
│   ├── App.tsx           # Main application component
│   └── App.css           # Global styles
├── data/
│   └── products.json     # Test product catalog
├── scripts/
│   └── index-products.js # Data indexing script
└── package.json
```

## Test Data

The application includes a comprehensive test dataset with 20 products across various categories:

- **Electronics**: Laptops, smartphones, audio equipment
- **Home & Kitchen**: Appliances, furniture, cookware
- **Gaming**: Consoles and accessories
- **Fitness**: Exercise equipment
- **Luxury**: Watches and premium items
- **Transportation**: Electric vehicles

Each product includes detailed specifications, ratings, pricing, and availability information.

## Search Features

### Basic Search
- Enter keywords in the search bar
- Auto-complete suggestions appear as you type
- Search across product names, descriptions, brands, and specifications

### Advanced Filtering
- **Category**: Filter by product category
- **Brand**: Filter by manufacturer
- **Price Range**: Set minimum and maximum price limits or use quick-select buttons
- **Rating**: Filter by minimum star rating
- **Availability**: Filter by stock status

### Sorting Options
- **Relevance**: Default search relevance scoring
- **Price**: Sort by price (ascending/descending)
- **Rating**: Sort by customer rating
- **Name**: Alphabetical sorting

## API Endpoints

The application communicates with OpenSearch using these endpoints:

- `POST /products/_search` - Main search functionality
- `GET /products/_doc/{id}` - Get individual product details
- `POST /products/_search` - Get filter aggregations

## Available Scripts

### `npm start`
Runs the React app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it.

### `npm run server`
Starts the Express proxy server on port 4000 for API communication with OpenSearch.

### `npm run build`
Builds the app for production to the `build` folder with optimizations.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run index-data`
Runs the OpenSearch indexing script to create the index and populate it with test data.

## Catalog Management

### Creating and Managing the Product Index

#### Index Structure
The OpenSearch index uses the following mapping:

```javascript
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "description": { "type": "text", "analyzer": "standard" },
      "category": { "type": "keyword" },
      "subcategory": { "type": "keyword" },
      "brand": { "type": "keyword" },
      "price": { "type": "float" },
      "currency": { "type": "keyword" },
      "rating": { "type": "float" },
      "reviews_count": { "type": "integer" },
      "availability": { "type": "keyword" },
      "specifications": { "type": "object", "dynamic": true },
      "tags": { "type": "keyword" },
      "image_url": { "type": "keyword" }
    }
  }
}
```

#### Adding New Products

**1. Update the JSON catalog:**
```bash
vim data/products.json
```

**2. Add product with required fields:**
```json
{
  "id": "unique-product-id",
  "name": "Product Name",
  "description": "Detailed product description",
  "category": "Primary Category",
  "subcategory": "Sub Category",
  "brand": "Brand Name",
  "price": 299.99,
  "currency": "USD",
  "rating": 4.5,
  "reviews_count": 150,
  "availability": "In Stock",
  "specifications": {
    "key1": "value1",
    "key2": "value2"
  },
  "tags": ["tag1", "tag2", "tag3"],
  "image_url": "https://example.com/image.jpg"
}
```

**3. Re-index the catalog:**
```bash
npm run index-data
```

#### Bulk Data Import

For larger datasets, modify `scripts/index-products.js`:

```javascript
// Read from CSV, database, or API
const products = await loadProductsFromSource();

// Transform to required format
const transformedProducts = products.map(transformProduct);

// Bulk index
await bulkIndexProducts(transformedProducts);
```

#### Index Management Commands

```bash
# Check index health
curl "localhost:30920/_cluster/health?pretty"

# View index mapping
curl "localhost:30920/products/_mapping?pretty"

# Get index statistics
curl "localhost:30920/products/_stats?pretty"

# Delete index (careful!)
curl -X DELETE "localhost:30920/products"

# Search all products
curl -X POST "localhost:30920/products/_search?pretty" -H "Content-Type: application/json" -d '{
  "query": { "match_all": {} },
  "size": 10
}'
```

## Design Details

### UI/UX Design Principles

1. **Mobile-First Approach**: Responsive design starting from mobile screens
2. **Progressive Enhancement**: Core functionality works without JavaScript
3. **Accessible Design**: WCAG 2.1 compliant with proper ARIA labels
4. **Performance Optimized**: Lazy loading, code splitting, and efficient re-renders
5. **Consistent Visual Language**: Unified color scheme, typography, and spacing

### Component Design Patterns

#### 1. Container/Presenter Pattern
- **Container Components**: Handle state and business logic (App.tsx)
- **Presenter Components**: Handle UI rendering (ProductCard.tsx)

#### 2. Compound Components
- SearchFilters combines multiple filter controls
- Each filter is independently manageable

#### 3. Render Props Pattern
- InfiniteScroll provides scroll behavior
- Custom render functions for loading states

### Styling Architecture

#### CSS Organization
```
src/
├── App.css                 # Global styles and CSS variables
└── components/
    ├── SearchBar.css       # Component-specific styles
    ├── SearchFilters.css   # Scoped styling
    ├── SearchResults.css   # Grid and layout
    └── ProductCard.css     # Card component styles
```

#### CSS Custom Properties
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --accent-color: #f59e0b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --border-radius: 8px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --transition: all 0.2s ease-in-out;
}
```

### Performance Optimizations

1. **React.memo**: Prevent unnecessary re-renders
2. **useCallback**: Memoize event handlers
3. **useMemo**: Cache expensive calculations
4. **Code Splitting**: Dynamic imports for large components
5. **Image Optimization**: Placeholder images and lazy loading
6. **Debounced Search**: Prevent excessive API calls

## Extension Guide

### Adding New Components

#### 1. Create Component Structure
```bash
mkdir src/components/NewComponent
touch src/components/NewComponent/index.tsx
touch src/components/NewComponent/NewComponent.css
```

#### 2. Component Template
```typescript
import React from 'react';
import './NewComponent.css';

interface NewComponentProps {
  // Define props with TypeScript
  title: string;
  onAction?: () => void;
}

const NewComponent: React.FC<NewComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="new-component">
      <h3>{title}</h3>
      {onAction && (
        <button onClick={onAction}>
          Action
        </button>
      )}
    </div>
  );
};

export default NewComponent;
```

### Adding New Search Features

#### 1. Extend Search Service
```typescript
// In searchService.ts
export interface ExtendedSearchParams extends SearchParams {
  newFilter?: string;
}

class SearchService {
  async searchWithNewFeature(params: ExtendedSearchParams) {
    // Implement new search logic
    const searchBody = this.buildExtendedQuery(params);
    return this.executeSearch(searchBody);
  }
}
```

#### 2. Update Components
```typescript
// Update SearchFilters to include new filter
const handleNewFilter = (value: string) => {
  handleFilterChange('newFilter', value);
};
```

### Adding New Data Fields

#### 1. Update TypeScript Interfaces
```typescript
// In searchService.ts
export interface Product {
  // ... existing fields
  newField: string;
  optionalField?: number;
}
```

#### 2. Update Index Mapping
```javascript
// In scripts/index-products.js
const indexMapping = {
  mappings: {
    properties: {
      // ... existing mappings
      newField: { type: 'keyword' },
      optionalField: { type: 'integer' }
    }
  }
};
```

#### 3. Update UI Components
```typescript
// In ProductCard.tsx
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card">
      {/* ... existing content */}
      <div className="new-field">
        {product.newField}
      </div>
    </div>
  );
};
```

### Custom Styling

#### 1. Override CSS Variables
```css
/* In App.css or custom theme file */
:root {
  --primary-color: #your-brand-color;
  --border-radius: 12px;
  --custom-font: 'Your Font', sans-serif;
}
```

#### 2. Add Component Variants
```css
/* Component-specific customizations */
.product-card.premium {
  border: 2px solid var(--accent-color);
  background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
}

.search-bar.large {
  --search-height: 56px;
  --search-font-size: 18px;
}
```

### Integration Examples

#### 1. Adding Authentication
```typescript
// Create auth service
export class AuthService {
  async getToken(): Promise<string> {
    // Implementation
  }
}

// Update searchService to include auth
class SearchService {
  private authService = new AuthService();
  
  async search(params: SearchParams): Promise<SearchResult> {
    const token = await this.authService.getToken();
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
```

#### 2. Adding Analytics
```typescript
// Analytics tracking
const trackSearch = (query: string, results: number) => {
  // Google Analytics, Mixpanel, etc.
  gtag('event', 'search', {
    search_term: query,
    result_count: results
  });
};

// In SearchResults component
useEffect(() => {
  if (products.length > 0) {
    trackSearch(searchParams.query, total);
  }
}, [searchParams.query, total]);
```

### Production Deployment

#### 1. Environment Configuration
```bash
# Create .env.production
REACT_APP_API_URL=https://your-api.com
REACT_APP_OPENSEARCH_URL=https://your-opensearch.com
```

#### 2. Build Optimization
```bash
# Build for production
npm run build

# Analyze bundle size
npx webpack-bundle-analyzer build/static/js/*.js
```

#### 3. Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Testing

### Unit Tests
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';

test('renders product card with name', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    // ... other required fields
  };
  
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
});
```

### E2E Testing
```javascript
// Cypress example
describe('Search functionality', () => {
  it('should search and display results', () => {
    cy.visit('/');
    cy.get('[data-testid="search-input"]').type('MacBook');
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="product-card"]').should('be.visible');
  });
});
```

## Troubleshooting

### OpenSearch Connection Issues
- Verify OpenSearch is running: `curl http://localhost:30920/_cluster/health`
- Check CORS settings if running on different ports
- Ensure the index exists: `curl http://localhost:30920/products`
- Verify network connectivity and firewall settings

### Build Issues
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Clear React cache: `rm -rf build && npm start`
- Check Node.js version compatibility

### Search Not Working
- Verify data is indexed: `npm run index-data`
- Check browser console for errors
- Confirm OpenSearch index mapping
- Test API endpoints directly with curl

### Performance Issues
- Enable React DevTools Profiler
- Check for unnecessary re-renders
- Optimize large datasets with pagination
- Consider implementing virtual scrolling

### CORS Errors
- Check allowed origins in `server/index.js`
- Verify the proxy server is running
- Update CORS settings for your domain

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Submit a pull request

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Keep components small and focused

## License

This project is for educational and demonstration purposes.
