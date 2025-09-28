# MongoDB CMS Implementation Guide

This repository now includes a comprehensive MongoDB-based Content Management System that exceeds Contentful capabilities while maintaining similar performance and stability.

## 🏗️ Architecture Overview

The MongoDB CMS consists of:

- **Enhanced Models**: Rich content schemas with validation and relationships
- **Admin API** (`/api/cms`): Full CRUD operations for content management
- **Public API** (`/api/content`): Optimized content delivery with caching
- **Migration Tools**: Data import/export and validation utilities

## 📊 Content Models

### Core Models

1. **Artist** - Creator profiles with portfolios and social links
2. **Enhanced Product** - Rich product data with SEO and media
3. **MediaItem** - Flexible media management with tags and metadata
4. **Achievement** - Gaming achievements with unlock conditions
5. **CMSPage** - Dynamic pages with custom layouts and components

### Model Features

- **Validation**: Comprehensive data validation with custom rules
- **Relationships**: Automatic population of referenced content
- **Indexing**: Optimized database indexes for performance
- **Versioning**: Built-in content versioning support
- **SEO**: Rich metadata and SEO optimization fields

## 🚀 Getting Started

### 1. Migration Setup

Run the migration script to set up your content:

```bash
# Full migration (all content types)
node backend/migrate-cms.js --full

# Partial migration (specific types)
node backend/migrate-cms.js --artists --products

# Check migration status
node backend/migrate-cms.js --status
```

### 2. Start the Server

Use VS Code tasks or run manually:

```bash
# Using VS Code tasks (recommended)
Ctrl+Shift+P → "Tasks: Run Task" → "Start Full Stack"

# Or manually
npm run dev  # Backend
npm start --prefix frontend  # Frontend
```

### 3. Access the CMS

- **Admin Interface**: `http://localhost:5000/api/cms/*`
- **Public Content**: `http://localhost:3002/api/content/*`
- **Dashboard**: `http://localhost:5000/api/cms/dashboard`

## 📝 API Endpoints

### Admin API (`/api/cms`)

#### Artists

- `GET /api/cms/artists` - List artists with filtering
- `POST /api/cms/artists` - Create new artist
- `GET /api/cms/artists/:id` - Get artist details
- `PUT /api/cms/artists/:id` - Update artist
- `DELETE /api/cms/artists/:id` - Delete artist

#### Products

- `GET /api/cms/products` - List products with filtering
- `POST /api/cms/products` - Create new product
- `GET /api/cms/products/:id` - Get product details
- `PUT /api/cms/products/:id` - Update product
- `DELETE /api/cms/products/:id` - Delete product
- `POST /api/cms/products/bulk` - Bulk operations

#### Media Items

- `GET /api/cms/media` - List media with filtering
- `POST /api/cms/media` - Create new media item
- `GET /api/cms/media/:id` - Get media details
- `PUT /api/cms/media/:id` - Update media
- `DELETE /api/cms/media/:id` - Delete media

#### Achievements

- `GET /api/cms/achievements` - List achievements
- `POST /api/cms/achievements` - Create achievement
- `GET /api/cms/achievements/:id` - Get achievement details
- `PUT /api/cms/achievements/:id` - Update achievement
- `DELETE /api/cms/achievements/:id` - Delete achievement

### Public Content API (`/api/content`)

#### Optimized Content Delivery

- `GET /api/content/artists` - Public artist listings (cached)
- `GET /api/content/artists/:slug` - Artist profile by slug
- `GET /api/content/products` - Product catalog with filtering
- `GET /api/content/products/:slug` - Product details by slug
- `GET /api/content/media` - Media gallery with pagination
- `GET /api/content/search?q=term` - Full-text search across content

#### Performance Features

- **Caching**: 5-minute cache for frequently accessed content
- **Aggregation**: Optimized MongoDB pipelines
- **Pagination**: Efficient pagination with metadata
- **Filtering**: Advanced filtering and sorting options

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# CMS Configuration
CMS_CACHE_DURATION=300  # Cache duration in seconds (default: 5 minutes)
CMS_PAGE_SIZE=12        # Default page size for listings
CMS_MAX_PAGE_SIZE=100   # Maximum allowed page size

# Search Configuration
MONGODB_TEXT_SEARCH=true  # Enable text search indexes
```

### Performance Optimization

The CMS includes several performance optimizations:

1. **Database Indexes**: Automatic index creation for frequent queries
2. **Aggregation Pipelines**: Optimized data retrieval
3. **Response Caching**: In-memory caching for public API
4. **Pagination**: Efficient large dataset handling
5. **Field Selection**: Minimal data transfer

## 🎮 Gaming Integration

The CMS integrates with the existing gaming system:

- **Achievement Unlocks**: Game progress unlocks CMS content
- **Content Rewards**: High scores unlock premium products
- **Dynamic Content**: Game state affects content visibility

### Achievement Configuration

```javascript
// Example achievement
{
  name: "Frequency Master",
  description: "Score 150+ in the frequency matching game",
  icon: "🎵",
  unlockConditions: {
    gameType: "frequency-matching",
    minScore: 150,
    requiresAuth: false
  },
  rewards: {
    unlockedContent: ["earl-analysis-collection"],
    bonusPoints: 50
  }
}
```

## 🔒 Security Features

- **Authentication**: Admin routes require authentication
- **Authorization**: Role-based access control
- **Validation**: Comprehensive input validation
- **Rate Limiting**: API rate limiting (configurable)
- **CORS**: Proper CORS configuration for public API

## 📈 Monitoring & Analytics

### Dashboard Metrics

Access `GET /api/cms/dashboard` for:

- Content statistics (counts by type)
- Popular content metrics
- Recent activity logs
- Performance metrics
- Error tracking

### Performance Monitoring

The CMS includes built-in monitoring:

- Response time tracking
- Cache hit/miss ratios
- Query performance metrics
- Error rate monitoring

## 🔄 Data Migration

### From Existing Data

The migration script handles:

- **Product Migration**: Enhances existing products
- **User Integration**: Links content to user accounts
- **Media Organization**: Organizes existing uploads
- **Achievement Setup**: Creates gaming achievements

### Backup & Restore

```bash
# Export content
node backend/migrate-cms.js --export --output=backup.json

# Import content
node backend/migrate-cms.js --import --input=backup.json

# Validate data integrity
node backend/migrate-cms.js --validate
```

## 🎨 Frontend Integration

### React Components

Example integration with existing React screens:

```jsx
// In ProductListScreen.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const EnhancedProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/api/content/products", {
          params: {
            page: 1,
            limit: 12,
            category: "digital-art",
            sort: "featured",
          },
        });
        setProducts(data.content);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Render logic...
};
```

### Redux Integration

Update your Redux actions to use the new CMS API:

```javascript
// Enhanced product actions
export const listProducts =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch({ type: "PRODUCT_LIST_REQUEST" });

      const { data } = await axios.get("/api/content/products", { params });

      dispatch({
        type: "PRODUCT_LIST_SUCCESS",
        payload: {
          products: data.content,
          pagination: data.pagination,
          filters: data.filters,
        },
      });
    } catch (error) {
      dispatch({
        type: "PRODUCT_LIST_FAIL",
        payload: error.response?.data?.message || error.message,
      });
    }
  };
```

## 🚀 Deployment

### Production Considerations

1. **Database Indexes**: Ensure indexes are created in production
2. **Caching**: Configure Redis for production caching
3. **CDN**: Use CDN for media delivery
4. **Monitoring**: Set up application monitoring
5. **Backups**: Implement regular database backups

### Environment Variables

Production-specific variables:

```env
NODE_ENV=production
REDIS_URL=redis://your-redis-instance
CDN_BASE_URL=https://your-cdn.com
MONGODB_URI=mongodb://your-production-db
```

## 🔍 Troubleshooting

### Common Issues

1. **Migration Failures**: Check MongoDB connection and permissions
2. **Performance Issues**: Verify database indexes are created
3. **Cache Problems**: Clear cache with `DELETE /api/cms/cache`
4. **Validation Errors**: Check model schemas and required fields

### Debug Mode

Enable debug logging:

```env
DEBUG=cms:*,content:*
LOG_LEVEL=debug
```

## 📚 Comparison with Contentful

| Feature                | MongoDB CMS                         | Contentful               |
| ---------------------- | ----------------------------------- | ------------------------ |
| **Performance**        | Native queries, custom optimization | CDN + API limits         |
| **Flexibility**        | Full schema control                 | Predefined content types |
| **Cost**               | Infrastructure only                 | Usage-based pricing      |
| **Gaming Integration** | Native support                      | Requires webhooks        |
| **Custom Logic**       | Full backend control                | Limited to apps          |
| **Offline Capability** | Full offline support                | Limited                  |
| **Real-time Features** | Socket.IO integration               | Webhooks only            |

## 🎯 Next Steps

1. **Run Migration**: Execute migration script with your content
2. **Test APIs**: Verify all endpoints work correctly
3. **Update Frontend**: Integrate new API endpoints
4. **Performance Testing**: Load test with your expected traffic
5. **Production Deployment**: Deploy with proper monitoring

This MongoDB CMS provides superior performance and flexibility compared to Contentful while maintaining stability through proper validation, caching, and error handling.
