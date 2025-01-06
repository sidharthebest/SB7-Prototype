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

        // Special handling for the first featured product
        const productLink = index === 0 ? '/products/featured-1.html' : `/product-detail.html?id=${product.id}`;
        
        return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 
             ${glowStyles[index]} max-w-xs mx-auto cursor-pointer"
             onclick="window.location.href='${productLink}'">
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
                        <button onclick="handleWishlistClick(event)" 
                            class="p-1.5 text-gray-600 hover:text-red-500 transition duration-300"
                            data-product-id="${product.id}">
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

function handleWishlistClick(event) {
    event.preventDefault();
    event.stopPropagation(); // Prevent triggering the product card click
    
    // Check if user is logged in (you'll need to implement this check based on your auth system)
    const isLoggedIn = false; // Replace with actual login check
    
    if (!isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = '/login.html';
        return;
    }
    
    // If logged in, handle adding to wishlist
    const productId = event.currentTarget.dataset.productId;
    addToWishlist(productId);
}

// When creating product cards, modify the wishlist button to use this handler
function createProductCard(product) {
    return `
        <div class="bg-white rounded-lg shadow-md p-4">
            <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover mb-4">
            <h3 class="text-lg font-bold">${product.name}</h3>
            <p class="text-gray-600">${product.price}</p>
            <div class="mt-4 flex justify-between items-center">
                <button class="text-gray-500 hover:text-red-500 wishlist-btn" 
                        onclick="handleWishlistClick(event)" 
                        data-product-id="${product.id}">
                    <i class="far fa-heart"></i>
                </button>
                <button class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Add this function to check login status and update navigation
function updateNavigation() {
    const isLoggedIn = false; // Replace with actual login check
    const navItems = document.querySelector('.flex.items-center.space-x-4');
    
    if (isLoggedIn) {
        // Add wishlist button if logged in
        const wishlistLink = document.createElement('a');
        wishlistLink.href = '/wishlist.html';
        wishlistLink.className = 'text-gray-700 hover:text-black';
        wishlistLink.innerHTML = `
            <i class="fas fa-heart"></i>
            <span class="ml-1">Wishlist</span>
        `;
        // Insert wishlist link before the cart link
        navItems.insertBefore(wishlistLink, navItems.lastElementChild);
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', updateNavigation); 