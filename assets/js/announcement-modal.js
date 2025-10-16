// Announcement Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already seen the announcement
    const hasSeenAnnouncement = localStorage.getItem('hasSeenAtolyeAnnouncement');
    
    // Show modal only if user hasn't seen it
    if (!hasSeenAnnouncement) {
        setTimeout(() => {
            showAnnouncementModal();
        }, 1000); // Show after 1 second
    }
    
    function showAnnouncementModal() {
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }
    
    function closeAnnouncementModal() {
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            // Mark as seen
            localStorage.setItem('hasSeenAtolyeAnnouncement', 'true');
        }
    }
    
    // Close button click
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAnnouncementModal);
    }
    
    // Close when clicking outside modal
    const modal = document.getElementById('announcementModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAnnouncementModal();
            }
        });
    }
    
    // Later button - just close the modal
    const laterBtn = document.querySelector('.modal-btn-secondary');
    if (laterBtn) {
        laterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeAnnouncementModal();
        });
    }
    
    // View participants button - mark as seen and navigate
    const viewBtn = document.querySelector('.modal-btn-primary');
    if (viewBtn) {
        viewBtn.addEventListener('click', function() {
            localStorage.setItem('hasSeenAtolyeAnnouncement', 'true');
        });
    }
});

// Optional: Function to reset the announcement (for testing)
function resetAnnouncement() {
    localStorage.removeItem('hasSeenAtolyeAnnouncement');
    location.reload();
}
