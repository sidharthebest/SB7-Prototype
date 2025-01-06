document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetails(productId);
        loadProductReviews(productId);
    }
});

async function loadProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

function displayProductDetails(product) {
    // Set main product info
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = `₹${product.price.toLocaleString('en-IN')}`;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('main-image').src = product.images[0];
    
    // Display thumbnails
    const thumbnailContainer = document.getElementById('thumbnail-container');
    thumbnailContainer.innerHTML = product.images.map(image => `
        <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
            <img src="${image}" alt="" class="w-full h-full object-center object-cover" 
                 onclick="updateMainImage('${image}')">
        </div>
    `).join('');

    // Display size options
    const sizeContainer = document.getElementById('size-options');
    sizeContainer.innerHTML = JSON.parse(product.sizes).map(size => `
        <button class="mr-2 px-4 py-2 border rounded-md hover:border-black" 
                onclick="selectSize('${size}')">${size}</button>
    `).join('');
}

function updateMainImage(imageSrc) {
    document.getElementById('main-image').src = imageSrc;
}

let selectedSize = null;
function selectSize(size) {
    selectedSize = size;
    // Update UI to show selected size
    const sizeButtons = document.querySelectorAll('#size-options button');
    sizeButtons.forEach(button => {
        if (button.textContent === size) {
            button.classList.add('border-black');
        } else {
            button.classList.remove('border-black');
        }
    });
}

async function loadProductReviews(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/reviews`);
        const reviews = await response.json();
        displayReviews(reviews);
        checkIfUserCanReview(productId);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = reviews.map(review => `
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center mb-4">
                <div class="flex text-yellow-400">
                    ${generateStarRating(review.rating)}
                </div>
                <span class="ml-2 text-gray-600">${review.user_name}</span>
                <span class="ml-2 text-gray-400">${formatDate(review.created_at)}</span>
            </div>
            <p class="text-gray-700 mb-4">${review.comment}</p>
            ${generateMediaGallery(review.media)}
        </div>
    `).join('');
}

function generateStarRating(rating) {
    return Array(5).fill().map((_, i) => `
        <i class="fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}"></i>
    `).join('');
}

function generateMediaGallery(media) {
    if (!media || media.length === 0) return '';
    
    return `
        <div class="grid grid-cols-4 gap-2">
            ${media.map(item => {
                if (item.type === 'image') {
                    return `<img src="${item.url}" alt="Review image" class="rounded">`;
                } else {
                    return `<video src="${item.url}" controls class="rounded"></video>`;
                }
            }).join('')}
        </div>
    `;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

async function checkIfUserCanReview(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/can-review`);
        const { canReview } = await response.json();
        
        if (canReview) {
            document.getElementById('review-form').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error checking review eligibility:', error);
    }
}

async function submitReview(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/reviews/create', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Review submitted successfully!');
            location.reload();
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
} 