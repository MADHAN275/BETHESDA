// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initAnimations();
    initBackgroundSlider(); // Background slideshow
    initForm();
    fetchReviews(); // Fetch real data from backend
    initTilt();
});

// --- Global Data ---
let reviewsData = [];

// --- Smooth Scroll (Lenis) ---
function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// --- GSAP Animations ---
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Reveal
    const tl = gsap.timeline();
    tl.from('.hero-title span', { y: 100, opacity: 0, duration: 1, stagger: 0.2, ease: 'power4.out' })
      .from('.hero-subtitle', { y: 50, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.5')
      .from('.hero-decoration', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.5')
      .from('.hero-buttons', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' }, '-=0.5');

    // Section Headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Cards Reveal
    gsap.from('.description-card', {
        scrollTrigger: {
            trigger: '.description-card',
            start: 'top 75%',
        },
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power4.out'
    });

    gsap.from('.form-card', {
        scrollTrigger: {
            trigger: '.form-card',
            start: 'top 75%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
}

// --- Background Slider ---
const backgroundImages = [
    './1.jpg',
    './2.jpg',
    './3.jpg',
    './4.jpeg',
    './5.jpg',
    './6.jpg'
];

function initBackgroundSlider() {
    const sliderContainer = document.getElementById('bg-slider');
    const overlay = sliderContainer.querySelector('.overlay-gradient');
    
    // Create image elements
    backgroundImages.forEach((url, index) => {
        const div = document.createElement('div');
        div.className = `bg-slide ${index === 0 ? 'active' : ''}`;
        div.style.backgroundImage = `url(${url})`;
        sliderContainer.insertBefore(div, overlay); // Insert before overlay
    });

    const slides = document.querySelectorAll('.bg-slide');
    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 3000); // Change every 3 seconds
}

// --- API Logic ---
async function fetchReviews() {
    try {
        const response = await fetch('/api/reviews'); // Relative path for production
        if (!response.ok) throw new Error('Failed to fetch reviews');
        reviewsData = await response.json();
        renderReviews(reviewsData);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        document.getElementById('reviews-grid').innerHTML = '<p style="text-align:center; width:100%;">Failed to load reviews. Please try again later.</p>';
    }
}

// --- Reviews Logic ---
function renderReviews(reviews) {
    const grid = document.getElementById('reviews-grid');
    grid.innerHTML = '';

    if (reviews.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color: #666;">No reviews yet. Be the first to share!</p>';
        return;
    }

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'glass-card review-card';
        card.style.opacity = '0'; // Start hidden for animation
        
        // Format Date
        const dateObj = new Date(review.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric' 
        });

        card.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-name">
                        <h4>${review.name}</h4>
                        <span class="category-badge">${review.category}</span>
                    </div>
                </div>
                <div class="review-stars">
                    ${generateStars(review.rating)}
                </div>
            </div>
            <p class="review-text">"${review.text}"</p>
            <span class="review-date">${formattedDate}</span>
        `;
        grid.appendChild(card);
    });
    
    // Animate new cards - Ensure DOM is ready
    setTimeout(() => {
        gsap.to('.review-card', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '#reviews-grid',
                start: 'top 90%'
            }
        });
    }, 100);
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else {
            stars += '<i class="fa-regular fa-star"></i>';
        }
    }
    return stars;
}

// --- Form Logic ---
function initForm() {
    // Star Rating Interaction
    const stars = document.querySelectorAll('#star-rating i');
    const ratingInput = document.getElementById('rating-input');

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const val = star.getAttribute('data-value');
            highlightStars(val);
        });

        star.addEventListener('click', () => {
            const val = star.getAttribute('data-value');
            ratingInput.value = val;
            highlightStars(val, true);
        });
    });

    document.querySelector('.rating-group').addEventListener('mouseleave', () => {
        if (ratingInput.value) {
            highlightStars(ratingInput.value, true);
        } else {
            highlightStars(0);
        }
    });

    function highlightStars(val, isSelected = false) {
        stars.forEach(s => {
            if (s.getAttribute('data-value') <= val) {
                if (isSelected) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid', 'active');
                } else {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid', 'hovered');
                }
            } else {
                s.classList.remove('fa-solid', 'active', 'hovered');
                s.classList.add('fa-regular');
            }
        });
    }

    // Character Count
    const textarea = document.getElementById('testimony');
    const countSpan = document.getElementById('current-count');
    textarea.addEventListener('input', () => {
        countSpan.textContent = textarea.value.length;
    });

    // Form Submission
    const form = document.getElementById('review-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.querySelector('span').innerText;
        
        // Loading state
        submitBtn.querySelector('span').innerText = 'Submitting...';
        submitBtn.style.opacity = '0.8';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const reviewData = {
            name: formData.get('name') || 'Anonymous',
            rating: parseInt(formData.get('rating')),
            category: formData.get('category'),
            text: formData.get('testimony')
        };

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) throw new Error('Submission failed');

            const savedReview = await response.json();

            // Add to local data and re-render
            reviewsData.unshift(savedReview);
            renderReviews(reviewsData);

            // Reset form
            form.reset();
            highlightStars(0);
            countSpan.textContent = '0';
            ratingInput.value = ''; // Ensure hidden input is cleared
            
            // Success state
            submitBtn.querySelector('span').innerText = 'Submitted!';
            
            setTimeout(() => {
                submitBtn.querySelector('span').innerText = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
                alert('Thank you for sharing your testimony!');
            }, 1000);

            // Scroll to reviews
            document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error submitting review:', error);
            submitBtn.querySelector('span').innerText = 'Error';
            setTimeout(() => {
                submitBtn.querySelector('span').innerText = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
                alert('Failed to submit review. Please try again.');
            }, 2000);
        }
    });
}

// --- Tilt Effect Initialization ---
function initTilt() {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
    });
}