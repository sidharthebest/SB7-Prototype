document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupCategoryFilters();
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products/collection');
        const products = await response.json();
        console.log('Collection products:', products);
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    console.log('First product image path:', products[0].image_url); // Debug log
    
    const container = document.getElementById('collections-container');
    container.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden" data-category="${product.category}">
            <div class="h-[300px] overflow-hidden bg-gray-100">
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
                        <button onclick="addToWishlist(${product.id})" 
                            class="p-1.5 text-gray-600 hover:text-red-500">
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

    // Add click handlers for size buttons
    document.querySelectorAll('.size-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from siblings
            this.parentElement.querySelectorAll('.size-btn').forEach(btn => {
                btn.classList.remove('bg-black', 'text-white');
                btn.classList.add('border-gray-300');
            });
            // Add active class to clicked button
            this.classList.remove('border-gray-300');
            this.classList.add('bg-black', 'text-white');
        });
    });
}

function setupCategoryFilters() {
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Update button styles
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('bg-black', 'text-white');
                btn.classList.add('bg-white', 'text-black', 'border');
            });
            this.classList.remove('bg-white', 'text-black', 'border');
            this.classList.add('bg-black', 'text-white');

            // Filter products
            const category = this.dataset.category;
            const products = document.querySelectorAll('#collections-container > div');
            
            products.forEach(product => {
                if (category === 'all' || product.dataset.category === category) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
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
