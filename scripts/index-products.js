const { Client } = require('@opensearch-project/opensearch');
const fs = require('fs');
const path = require('path');

// OpenSearch client configuration
const client = new Client({
  node: 'http://localhost:30920',
  ssl: {
    rejectUnauthorized: false
  }
});

const INDEX_NAME = 'products';

// Index mapping configuration
const indexMapping = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      description: {
        type: 'text',
        analyzer: 'standard'
      },
      category: {
        type: 'keyword',
        fields: {
          text: { type: 'text' }
        }
      },
      subcategory: {
        type: 'keyword',
        fields: {
          text: { type: 'text' }
        }
      },
      brand: {
        type: 'keyword',
        fields: {
          text: { type: 'text' }
        }
      },
      price: { type: 'float' },
      currency: { type: 'keyword' },
      rating: { type: 'float' },
      reviews_count: { type: 'integer' },
      availability: { type: 'keyword' },
      specifications: {
        type: 'object',
        dynamic: true
      },
      tags: { type: 'keyword' },
      image_url: { type: 'keyword' }
    }
  },
  settings: {
    number_of_shards: 1,
    number_of_replicas: 1,
    analysis: {
      analyzer: {
        standard: {
          type: 'standard'
        }
      }
    }
  }
};

async function createIndex() {
  try {
    // Check if index exists
    const indexExists = await client.indices.exists({
      index: INDEX_NAME
    });

    if (indexExists.body) {
      console.log(`Index '${INDEX_NAME}' already exists. Deleting...`);
      await client.indices.delete({
        index: INDEX_NAME
      });
    }

    // Create new index with mapping
    console.log(`Creating index '${INDEX_NAME}'...`);
    const response = await client.indices.create({
      index: INDEX_NAME,
      body: indexMapping
    });

    console.log('Index created successfully:', response.body);
    return true;
  } catch (error) {
    console.error('Error creating index:', error);
    return false;
  }
}

async function bulkIndexProducts() {
  try {
    // Read products data
    const dataPath = path.join(__dirname, '..', 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`Preparing to index ${productsData.length} products...`);

    // Prepare bulk request body
    const bulkBody = [];
    
    productsData.forEach(product => {
      // Add index action
      bulkBody.push({
        index: {
          _index: INDEX_NAME,
          _id: product.id
        }
      });
      
      // Add document data
      bulkBody.push(product);
    });

    // Execute bulk request
    console.log('Executing bulk index operation...');
    const response = await client.bulk({
      body: bulkBody
    });

    if (response.body.errors) {
      console.error('Bulk indexing completed with errors:');
      response.body.items.forEach((item, index) => {
        if (item.index && item.index.error) {
          console.error(`Error indexing product ${index}:`, item.index.error);
        }
      });
    } else {
      console.log(`Successfully indexed ${response.body.items.length} products`);
    }

    return true;
  } catch (error) {
    console.error('Error during bulk indexing:', error);
    return false;
  }
}

async function verifyIndexing() {
  try {
    // Wait a moment for indexing to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get index stats
    const stats = await client.indices.stats({
      index: INDEX_NAME
    });
    
    const docCount = stats.body.indices[INDEX_NAME].total.docs.count;
    console.log(`\nIndex verification: ${docCount} documents indexed`);
    
    // Search for a test product
    const searchResponse = await client.search({
      index: INDEX_NAME,
      body: {
        query: {
          match: {
            name: 'MacBook'
          }
        }
      }
    });
    
    console.log(`Test search for 'MacBook' returned ${searchResponse.body.hits.total.value} results`);
    
    return true;
  } catch (error) {
    console.error('Error during verification:', error);
    return false;
  }
}

async function main() {
  console.log('Starting OpenSearch indexing process...');
  
  // Test connection
  try {
    const info = await client.info();
    console.log('Connected to OpenSearch:', info.body.version.number);
  } catch (error) {
    console.error('Failed to connect to OpenSearch:', error.message);
    console.error('Make sure OpenSearch is running on localhost:30920');
    process.exit(1);
  }

  // Create index
  const indexCreated = await createIndex();
  if (!indexCreated) {
    console.error('Failed to create index');
    process.exit(1);
  }

  // Index products
  const productsIndexed = await bulkIndexProducts();
  if (!productsIndexed) {
    console.error('Failed to index products');
    process.exit(1);
  }

  // Verify indexing
  await verifyIndexing();
  
  console.log('\nIndexing process completed successfully!');
  console.log('You can now start the React application and search through the products.');
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  createIndex,
  bulkIndexProducts,
  verifyIndexing,
  INDEX_NAME
};
