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
        const contentTypes = ['events', 'education', 'projects', 'resources'];
        
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
            resources: { resources: [] }
        };
        return defaults[type] || {};
    }

    renderContent() {
        this.renderEvents();
        this.renderEducation();
        this.renderProjects();
        this.renderResources();
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
            </div>
        `).join('');
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
            'resources': 'resources'
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