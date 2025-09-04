import React from 'react';
import { Product } from '../services/searchService';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star filled">★</span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">☆</span>
        ))}
      </div>
    );
  };

  const getAvailabilityClass = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'in stock':
        return 'in-stock';
      case 'limited stock':
        return 'limited-stock';
      case 'out of stock':
        return 'out-of-stock';
      case 'pre-order':
        return 'pre-order';
      default:
        return 'unknown';
    }
  };

  const renderKeySpecifications = (specs: Record<string, any>) => {
    // Select key specifications to display (limit to 3-4 most important ones)
    const keySpecs = Object.entries(specs)
      .filter(([key, value]) => {
        // Filter out arrays and complex objects, keep simple values
        return typeof value === 'string' || typeof value === 'number';
      })
      .slice(0, 4);

    if (keySpecs.length === 0) return null;

    return (
      <div className="key-specifications">
        {keySpecs.map(([key, value]) => (
          <div key={key} className="spec-item">
            <span className="spec-key">{key.replace(/_/g, ' ')}:</span>
            <span className="spec-value">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.image_url} 
          alt={product.name}
          onError={(e) => {
            // Replace with a placeholder image if the original fails to load
            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Product+Image';
          }}
        />
        <div className={`availability-badge ${getAvailabilityClass(product.availability)}`}>
          {product.availability}
        </div>
      </div>
      
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-brand">{product.brand}</div>
        </div>

        <div className="product-category">
          <span className="category">{product.category}</span>
          {product.subcategory && (
            <>
              <span className="category-separator">›</span>
              <span className="subcategory">{product.subcategory}</span>
            </>
          )}
        </div>

        <p className="product-description">
          {product.description.length > 120 
            ? `${product.description.substring(0, 120)}...`
            : product.description
          }
        </p>

        {renderKeySpecifications(product.specifications)}

        <div className="product-rating">
          {renderStars(product.rating)}
          <span className="rating-value">{product.rating}</span>
          <span className="reviews-count">({product.reviews_count.toLocaleString()} reviews)</span>
        </div>

        <div className="product-tags">
          {product.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
          {product.tags.length > 3 && (
            <span className="tag-more">+{product.tags.length - 3}</span>
          )}
        </div>

        <div className="product-footer">
          <div className="product-price">
            {formatPrice(product.price, product.currency)}
          </div>
          <button 
            className="view-details-btn"
            onClick={() => {
              // In a real app, this would navigate to a product details page
              console.log('View details for product:', product.id);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
