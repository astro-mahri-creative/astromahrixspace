import axios from 'axios';

async function setFeaturedProducts() {
  try {
    // Get all products
    const response = await axios.get('http://localhost:5000/api/products');
    const products = response.data.products;
    
    console.log(`Found ${products.length} products`);
    
    // Set the first 3 products as featured
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const product = products[i];
      
      console.log(`Setting product "${product.name}" (${product._id}) as featured...`);
      
      // Update the product to be featured
      const updateResponse = await axios.put(`http://localhost:5000/api/products/${product._id}`, {
        ...product,
        featured: true,
        featuredOrder: i + 1
      });
      
      console.log(`✓ Product "${product.name}" is now featured with order ${i + 1}`);
    }
    
    console.log('\n🎉 Successfully set featured products!');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

setFeaturedProducts();