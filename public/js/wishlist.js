document.addEventListener('DOMContentLoaded', () => {
    loadWishlistProducts();
});

async function loadWishlistProducts() {
    try {
        console.log('Starting to load wishlist...');
        const response = await fetch('/api/wishlist');
        console.log('Wishlist response:', response);
        const products = await response.json();
        console.log('Wishlist products:', products);
        
        const container = document.getElementById('wishlist-container');
        console.log('Container found:', container); // Check if we found the container

        if (!container) {
            console.error('Wishlist container not found!');
            return;
        }

        if (products.length === 0) {
            console.log('No products in wishlist');
            container.innerHTML = `
                <div class="text-center py-8">
                    <h2 class="text-2xl font-bold text-gray-800">Your wishlist is empty</h2>
                    <p class="text-gray-600 mt-2">Add items to your wishlist to save them for later!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 max-w-xs mx-auto">
                <div class="h-[300px] overflow-hidden">
                    <img src="${product.image_url}" 
                        alt="${product.name}" 
                        class="w-full h-[300px] object-cover">
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
                        <span class="text-lg font-bold">₹${product.price}</span>
                        <div class="space-x-1">
                            <button onclick="removeFromWishlist(${product.id})" 
                                class="p-1.5 text-red-500 hover:text-gray-600">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button onclick="addToCart(${product.id})" 
                                class="bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 text-xs">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading wishlist:', error);
    }
}

async function removeFromWishlist(productId) {
    try {
        const response = await fetch(`/api/wishlist/remove/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Reload wishlist after removing item
            loadWishlistProducts();
        } else {
            alert('Failed to remove from wishlist');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
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
        if (response.ok) {
            alert('Added to cart!');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}
