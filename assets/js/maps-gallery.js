// Maps Gallery Management
class MapsGallery {
    constructor() {
        this.maps = [];
        this.filteredMaps = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        try {
            await this.loadMaps();
            this.setupFilters();
            this.renderMaps();
        } catch (error) {
            console.error('Harita galerisi yüklenirken hata oluştu:', error);
        }
    }

    async loadMaps() {
        try {
            const response = await fetch('content/maps/maps.json');
            if (response.ok) {
                const data = await response.json();
                this.maps = data.maps || [];
                this.filteredMaps = [...this.maps];
            } else {
                console.warn('Haritalar yüklenemedi');
                this.maps = [];
                this.filteredMaps = [];
            }
        } catch (error) {
            console.warn('Haritalar yüklenirken hata:', error);
            this.maps = [];
            this.filteredMaps = [];
        }
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Set current filter
                this.currentFilter = e.target.getAttribute('data-filter');
                
                // Filter and render maps
                this.filterMaps();
                this.renderMaps();
            });
        });
    }

    filterMaps() {
        if (this.currentFilter === 'all') {
            this.filteredMaps = [...this.maps];
        } else {
            this.filteredMaps = this.maps.filter(map => map.category === this.currentFilter);
        }
    }

    renderMaps() {
        const mapsContainer = document.getElementById('mapsGrid');
        if (!mapsContainer) return;

        if (this.filteredMaps.length === 0) {
            mapsContainer.innerHTML = `
                <div class="no-maps" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--gray);">
                    <h3>Bu kategoride henüz harita bulunmuyor</h3>
                    <p>Yakında bu kategoride haritalar eklenecek.</p>
                </div>
            `;
            return;
        }

        mapsContainer.innerHTML = this.filteredMaps.map(map => `
            <div class="map-card" data-category="${map.category}">
                <div class="map-image-container">
                    <img src="${map.image}" alt="${map.title}" class="map-image" 
                         onerror="this.src='assets/images/maps/placeholder-map.jpg'">
                    <button class="map-zoom-btn" onclick="openLightbox('${map.image}')" title="Büyüt">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                        </svg>
                    </button>
                    <div class="map-uploader">Hazırlayan: ${map.author}</div>
                    <div class="map-overlay">
                        <div class="map-category">${map.category}</div>
                    </div>
                </div>
                <div class="map-content">
                    <h3 class="map-title">${map.title}</h3>
                    <p class="map-description">${map.description}</p>
                    <div class="map-meta">
                        <div class="map-tools">
                            ${map.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add animation to cards
        this.animateCards();
        
        // Setup lightbox
        this.setupLightbox();
    }

    animateCards() {
        const cards = document.querySelectorAll('.map-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Method to add new map
    addMap(mapData) {
        const newMap = {
            id: this.maps.length + 1,
            ...mapData,
            featured: false
        };
        
        this.maps.push(newMap);
        this.filterMaps();
        this.renderMaps();
    }

    // Method to get maps by category
    getMapsByCategory(category) {
        return this.maps.filter(map => map.category === category);
    }

    // Method to get featured maps
    getFeaturedMaps() {
        return this.maps.filter(map => map.featured);
    }

    setupLightbox() {
        // Create lightbox if it doesn't exist
        if (!document.getElementById('lightbox')) {
            const lightbox = document.createElement('div');
            lightbox.id = 'lightbox';
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close" onclick="closeLightbox()">×</button>
                    <img src="" alt="Map preview">
                </div>
            `;
            document.body.appendChild(lightbox);

            // Close on background click
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });

            // Close on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeLightbox();
                }
            });
        }
    }
}

// Lightbox functions
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const img = lightbox.querySelector('img');
    img.src = imageSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize maps gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on maps gallery page
    if (window.location.pathname.includes('harita-galerisi.html')) {
        window.mapsGallery = new MapsGallery();
    }
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Scroll effect for header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'white';
        header.style.backdropFilter = 'none';
    }
});
