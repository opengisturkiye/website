// Content Management System
class ContentManager {
    constructor() {
        this.content = {};
        this.init();
    }

    async init() {
        try {
            await this.loadAllContent();
            this.renderContent();
        } catch (error) {
            console.error('İçerik yüklenirken hata oluştu:', error);
        }
    }

    async loadAllContent() {
        const contentTypes = ['events', 'education', 'projects', 'resources', 'maps', 'community', 'support'];
        
        for (const type of contentTypes) {
            try {
                const response = await fetch(`content/${type}/${type}.json`);
                if (response.ok) {
                    this.content[type] = await response.json();
                } else {
                    console.warn(`${type} içeriği yüklenemedi`);
                    this.content[type] = this.getDefaultContent(type);
                }
            } catch (error) {
                console.warn(`${type} içeriği yüklenirken hata:`, error);
                this.content[type] = this.getDefaultContent(type);
            }
        }
    }

    getDefaultContent(type) {
        const defaults = {
            events: { events: [] },
            education: { courses: [] },
            projects: { projects: [] },
            resources: { resources: [] },
            maps: { maps: [] },
            community: { stats: [], services: [] },
            support: { support: { title: '', description: '', options: [] } }
        };
        return defaults[type] || {};
    }

    renderContent() {
        this.renderEvents();
        this.renderEducation();
        this.renderProjects();
        this.renderResources();
        this.renderMaps();
        this.renderCommunity();
        this.renderSupport();
    }

    renderEvents() {
        const eventsContainer = document.querySelector('#etkinlikler .training-grid');
        if (!eventsContainer || !this.content.events?.events) return;

        eventsContainer.innerHTML = this.content.events.events.map(event => `
            <div class="training-card">
                <div class="training-badge">${event.badge}</div>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <ul class="training-details">
                    ${event.details.map(detail => `<li><strong>${detail.label}:</strong> ${detail.value}</li>`).join('')}
                </ul>
                ${event.hasParticipantList ? `
                    <div class="event-button-container" style="text-align: center; margin-top: 1rem;">
                        <a href="atolye/katilimcilar.html" class="btn-primary" style="padding: 0.5rem 1rem; border-radius: 5px; text-decoration: none; font-size: 0.9rem;">
                            Katılımcı Listesi
                        </a>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderMaps() {
        const mapsContainer = document.querySelector('#harita-galerisi .maps-grid');
        if (!mapsContainer || !this.content.maps?.maps) return;

        // Show only featured maps on main page
        const featuredMaps = this.content.maps.maps.filter(map => map.featured).slice(0, 4);

        mapsContainer.innerHTML = featuredMaps.map(map => `
            <div class="map-card">
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

        // Setup lightbox for main page
        this.setupLightbox();
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

    renderCommunity() {
        // Render stats
        const statsContainer = document.querySelector('.stats-grid');
        if (statsContainer && this.content.community?.stats) {
            statsContainer.innerHTML = this.content.community.stats.map(stat => `
                <div class="stat-item">
                    <h3>${stat.number}</h3>
                    <p>${stat.label}</p>
                </div>
            `).join('');
        }

        // Render services
        const servicesContainer = document.querySelector('.services-grid');
        if (servicesContainer && this.content.community?.services) {
            servicesContainer.innerHTML = this.content.community.services.map(service => `
                <div class="service-card">
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <ul class="service-features">
                        ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
    }

    renderSupport() {
        const supportContainer = document.querySelector('.support-content');
        if (!supportContainer || !this.content.support?.support) return;

        const support = this.content.support.support;
        supportContainer.innerHTML = `
            <h2>${support.title}</h2>
            <p>${support.description}</p>
            <div class="cta-options">
                ${support.options.map(option => `
                    <div class="cta-option">
                        <h4>${option.title}</h4>
                        <p>${option.description}</p>
                        <a href="${option.link}" target="_blank" class="btn-primary">${option.linkText}</a>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEducation() {
        const educationContainer = document.querySelector('#egitim .tech-grid');
        if (!educationContainer || !this.content.education?.courses) return;

        educationContainer.innerHTML = this.content.education.courses.map(course => `
            <div class="tech-card">
                <div class="tech-header">
                    <div class="tech-icon">${course.icon}</div>
                    <div>
                        <h3>${course.title}</h3>
                        <p style="margin: 0; color: var(--gray); font-size: 0.9rem;">${course.subtitle}</p>
                    </div>
                </div>
                <p class="tech-description">${course.description}</p>
                <div class="tech-capabilities">
                    <h4>Eğitim Modülleri</h4>
                    <ul>
                        ${course.modules.map(module => `<li>${module}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    renderProjects() {
        const projectsContainer = document.querySelector('#projeler .benefits-grid');
        if (!projectsContainer || !this.content.projects?.projects) return;

        projectsContainer.innerHTML = this.content.projects.projects.map(project => `
            <div class="benefit-card">
                <h4>${project.icon} ${project.title}</h4>
                <p>${project.description}</p>
            </div>
        `).join('');
    }

    renderResources() {
        const resourcesContainer = document.querySelector('#kaynaklar .community-grid');
        if (!resourcesContainer || !this.content.resources?.resources) return;

        resourcesContainer.innerHTML = this.content.resources.resources.map(resource => `
            <div class="community-card">
                <div class="${resource.iconClass}"></div>
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <a href="${resource.link}" class="community-link" target="_blank">${resource.linkText} →</a>
            </div>
        `).join('');
    }

    // İçerik güncelleme metodları
    async updateContent(type, newContent) {
        this.content[type] = newContent;
        
        // İlgili bölümü yeniden render et
        switch(type) {
            case 'events':
                this.renderEvents();
                break;
            case 'education':
                this.renderEducation();
                break;
            case 'projects':
                this.renderProjects();
                break;
            case 'resources':
                this.renderResources();
                break;
            case 'maps':
                this.renderMaps();
                break;
            case 'community':
                this.renderCommunity();
                break;
            case 'support':
                this.renderSupport();
                break;
        }
    }

    // Yeni içerik ekleme
    addContent(type, item) {
        const key = this.getContentKey(type);
        if (this.content[type] && this.content[type][key]) {
            this.content[type][key].push(item);
            this.updateContent(type, this.content[type]);
        }
    }

    getContentKey(type) {
        const keys = {
            'events': 'events',
            'education': 'courses',
            'projects': 'projects',
            'resources': 'resources',
            'maps': 'maps',
            'community': 'services',
            'support': 'support'
        };
        return keys[type];
    }
}

// Sayfa yüklendiğinde content manager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
    window.contentManager = new ContentManager();
});

// Smooth scroll navigation
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
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

// Global Lightbox functions for map gallery
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        // Create lightbox if it doesn't exist
        const newLightbox = document.createElement('div');
        newLightbox.id = 'lightbox';
        newLightbox.className = 'lightbox';
        newLightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="closeLightbox()">×</button>
                <img src="" alt="Map preview">
            </div>
        `;
        document.body.appendChild(newLightbox);

        // Close on background click
        newLightbox.addEventListener('click', (e) => {
            if (e.target === newLightbox) {
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
    
    const lb = document.getElementById('lightbox');
    const img = lb.querySelector('img');
    img.src = imageSrc;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}