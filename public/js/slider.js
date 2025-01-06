class ImageSlider {
    constructor(container) {
        this.container = container;
        this.mainImage = container.querySelector('#main-image');
        this.images = [];
        this.currentIndex = 0;

        // Add navigation buttons only if there's more than one image
        this.addNavigationButtons();
        
        // Add touch support
        this.setupTouchEvents();
        
        // Add keyboard support
        this.setupKeyboardEvents();
    }

    addNavigationButtons() {
        // Create navigation buttons
        const prevButton = document.createElement('button');
        prevButton.className = 'absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-all z-10';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-all z-10';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';

        // Add click events
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevImage();
        });
        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextImage();
        });

        // Only show navigation buttons if there's more than one image
        if (this.images.length > 1) {
            this.container.appendChild(prevButton);
            this.container.appendChild(nextButton);
        }
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });
    }

    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextImage(); // Swipe left
            } else {
                this.prevImage(); // Swipe right
            }
        }
    }

    setImages(imageUrls) {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            console.error('Invalid image array provided');
            return;
        }

        this.images = imageUrls;
        this.currentIndex = 0;
        this.updateImage();
        this.createThumbnails();

        // Show/hide navigation based on number of images
        const navButtons = this.container.querySelectorAll('button');
        navButtons.forEach(button => {
            button.style.display = this.images.length > 1 ? 'block' : 'none';
        });
    }

    createThumbnails() {
        const thumbnailContainer = document.getElementById('thumbnail-container');
        // Only show thumbnail container if there's more than one image
        if (this.images.length <= 1) {
            thumbnailContainer.style.display = 'none';
            return;
        }

        thumbnailContainer.style.display = 'grid';
        thumbnailContainer.innerHTML = this.images.map((image, index) => `
            <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
                <img src="${image}" alt="View ${index + 1}" 
                     class="w-full h-full object-center object-cover transition-opacity duration-300 ${index === this.currentIndex ? 'opacity-100 ring-2 ring-black' : 'opacity-60'}"
                     onclick="slider.showImage(${index})">
            </div>
        `).join('');
    }

    updateImage() {
        if (!this.mainImage || !this.images[this.currentIndex]) return;

        // Fade out current image
        this.mainImage.style.opacity = '0';
        
        // Change source and fade in
        setTimeout(() => {
            this.mainImage.src = this.images[this.currentIndex];
            this.mainImage.style.opacity = '1';
            this.updateThumbnails();
        }, 200);
    }

    updateThumbnails() {
        const thumbnails = document.querySelectorAll('#thumbnail-container img');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('opacity-60', index !== this.currentIndex);
            thumb.classList.toggle('opacity-100', index === this.currentIndex);
            thumb.classList.toggle('ring-2', index === this.currentIndex);
            thumb.classList.toggle('ring-black', index === this.currentIndex);
        });
    }

    showImage(index) {
        if (index < 0 || index >= this.images.length) return;
        this.currentIndex = index;
        this.updateImage();
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }
} 