document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products/featured');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = products.map((product, index) => {
        const glowStyles = [
            'hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] hover:bg-blue-100',
            'hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] hover:bg-red-100',
            'hover:shadow-[0_0_50px_rgba(34,197,94,0.8)] hover:bg-green-100'
        ];

        // Different image positions for each card
        const imagePositions = [
            '',                     // First image - no adjustment
            'object-[center_58%]',  // Second image - adjust focus point
            ''                      // Third image - no adjustment
        ];

        return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 
             ${glowStyles[index]} max-w-xs mx-auto">
            <div class="h-[300px] overflow-hidden">
                <img src="${product.image_url}" 
                    alt="${product.name}" 
                    class="w-full h-[300px] object-cover ${imagePositions[index]}">
            </div>
            <div class="p-4">
                <h3 class="text-lg font-serif font-bold mb-2">${product.name}</h3>
                <p class="text-gray-600 mb-3 text-xs">${product.description}</p>
                
                <!-- Size Options -->
                <div class="mb-3">
                    <h4 class="text-xs font-semibold mb-1">Select Size:</h4>
                    <div class="flex gap-1">
                        ${JSON.parse(product.sizes).map(size => `
                            <button class="size-btn border border-gray-300 px-2 py-0.5 rounded hover:border-black text-xs">
                                ${size}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold">₹${product.price.toLocaleString('en-IN')}</span>
                    <div class="space-x-1">
                        <button onclick="addToWishlist(${product.id})" 
                            class="p-1.5 text-gray-600 hover:text-red-500 transition duration-300">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button onclick="addToCart(${product.id})" 
                            class="bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition duration-300 text-xs">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
}

async function addToWishlist(productId) {
    try {
        const response = await fetch('/api/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });
        const result = await response.json();
        alert('Added to wishlist!');
    } catch (error) {
        console.error('Error adding to wishlist:', error);
    }
}

async function addToCart(productId) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity: 1 }),
        });
        const result = await response.json();
        alert('Added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
} 