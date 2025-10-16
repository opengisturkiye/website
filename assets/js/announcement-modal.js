// Announcement Modal Module
(function() {
    'use strict';
    
    // Modal configuration
    const MODAL_CONFIG = {
        id: 'announcementModal',
        storageKey: 'hasSeenAtolyeAnnouncement',
        showDelay: 500 // milliseconds
    };

    // Initialize modal on DOM ready
    function init() {
        // Check if user has already seen the announcement
        const hasSeenAnnouncement = localStorage.getItem(MODAL_CONFIG.storageKey);
        
        console.log('Modal init - Has seen:', hasSeenAnnouncement); // Debug log
        
        // Show modal only if user hasn't seen it
        if (!hasSeenAnnouncement) {
            setTimeout(() => {
                showModal();
            }, MODAL_CONFIG.showDelay);
        }
        
        // Setup event listeners
        setupEventListeners();
    }

    function showModal() {
        const modal = document.getElementById(MODAL_CONFIG.id);
        console.log('Showing modal:', modal); // Debug log
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Modal element not found!');
        }
    }

    function closeModal() {
        const modal = document.getElementById(MODAL_CONFIG.id);
        
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Mark as seen
            localStorage.setItem(MODAL_CONFIG.storageKey, 'true');
            console.log('Modal closed and marked as seen'); // Debug log
        }
    }

    function setupEventListeners() {
        const modal = document.getElementById(MODAL_CONFIG.id);
        
        if (!modal) {
            console.error('Modal not found, cannot setup listeners');
            return;
        }

        // Close button (X)
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Secondary button (Kapat)
        const laterBtn = modal.querySelector('.modal-btn-secondary');
        if (laterBtn) {
            laterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeModal();
            });
        }

        // Click outside modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Primary button - mark as seen and navigate
        const viewBtn = modal.querySelector('.modal-btn-primary');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                localStorage.setItem(MODAL_CONFIG.storageKey, 'true');
            });
        }
    }

    // Public API for debugging/testing
    window.AnnouncementModal = {
        show: showModal,
        close: closeModal,
        reset: function() {
            localStorage.removeItem(MODAL_CONFIG.storageKey);
            console.log('Modal reset - will show on next page load');
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }

})();
