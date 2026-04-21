import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './TestimonialSection.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const DEFAULT_TESTIMONIALS = [
  {
    id: 'default-1',
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    message: 'I wrote my manifestation on iBhakt and within 2 months I received the exact job offer I had been visualizing. The resonance score kept me motivated every day!',
    rating: 5,
    category: 'career',
    avatar_url: null,
  },
  {
    id: 'default-2',
    name: 'Rahul Deshmukh',
    location: 'Pune, India',
    message: 'The Karma Ledger changed how I see my daily actions. Tracking my karma made me more mindful and positive. My score went from 45 to 82 in just 3 months.',
    rating: 5,
    category: 'karma',
    avatar_url: null,
  },
  {
    id: 'default-3',
    name: 'Ananya Patel',
    location: 'Ahmedabad, India',
    message: 'My Kundli report from iBhakt was incredibly accurate. The dasha predictions helped me plan my career move at the right time. Truly life-changing!',
    rating: 5,
    category: 'spiritual',
    avatar_url: null,
  },
  {
    id: 'default-4',
    name: 'Vikram Singh',
    location: 'Delhi, India',
    message: 'I manifested finding my life partner through iBhakt. The cosmic alignment insights gave me clarity on the right time to commit. We got married last month!',
    rating: 5,
    category: 'love',
    avatar_url: null,
  },
  {
    id: 'default-5',
    name: 'Sneha Kulkarni',
    location: 'Nagpur, India',
    message: 'iBhakt helped me manifest my dream of starting my own business. The daily karma tracking kept me focused and the manifestation resonance score was spot on!',
    rating: 5,
    category: 'manifestation',
    avatar_url: null,
  },
  {
    id: 'default-6',
    name: 'Arjun Reddy',
    location: 'Hyderabad, India',
    message: 'The combination of Kundli insights and karma tracking is unique. No other app offers this. I have recommended iBhakt to all my friends and family.',
    rating: 4,
    category: 'spiritual',
    avatar_url: null,
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'manifestation', label: 'Manifestation' },
  { key: 'career', label: 'Career Growth' },
  { key: 'love', label: 'Love & Marriage' },
  { key: 'spiritual', label: 'Spiritual' },
  { key: 'karma', label: 'Karma' },
];

function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFiltered(testimonials);
    } else {
      setFiltered(testimonials.filter((t) => t.category === activeCategory));
    }
    setCurrentIndex(0);
  }, [activeCategory, testimonials]);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (isHovered || filtered.length <= 3) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, filtered.length - getVisibleCount());
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, filtered.length]);

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 992) return 2;
    return 3;
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${API_URL}/home/testimonials`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setTestimonials(data.data);
      } else {
        setTestimonials(DEFAULT_TESTIMONIALS);
      }
    } catch (err) {
      console.warn('Failed to load testimonials, using defaults:', err);
      setTestimonials(DEFAULT_TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, filtered.length - getVisibleCount());
      return prev >= maxIndex ? 0 : prev + 1;
    });
  }, [filtered.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, filtered.length - getVisibleCount());
      return prev <= 0 ? maxIndex : prev - 1;
    });
  }, [filtered.length]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi bi-star-fill ${i <= rating ? styles.star : styles.starEmpty}`}
        />
      );
    }
    return stars;
  };

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className="container">
          <div className={styles.loading}>
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Loading testimonials...
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const maxIndex = Math.max(0, filtered.length - getVisibleCount());
  const showControls = filtered.length > getVisibleCount();

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-lg-8 mx-auto text-center">
            <h2 className={`display-5 fw-bold mb-3 ${styles.sectionTitle}`}>
              Real Stories, Real Transformations
            </h2>
            <p className={`lead ${styles.sectionSubtitle}`}>
              See how iBhakt is helping people manifest their dreams, track their karma, and transform their lives.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className={styles.filterTabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.filterTab} ${activeCategory === cat.key ? styles.filterTabActive : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        {filtered.length > 0 ? (
          <div
            className={styles.carouselWrapper}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Prev Button */}
            {showControls && (
              <button className={styles.carouselPrev} onClick={goPrev} aria-label="Previous">
                <i className="bi bi-chevron-left" />
              </button>
            )}

            {/* Track */}
            <div className={styles.carouselViewport}>
              <div
                ref={trackRef}
                className={styles.carouselTrack}
                style={{
                  transform: `translateX(-${currentIndex * (100 / getVisibleCount())}%)`,
                }}
              >
                {filtered.map((item) => (
                  <div
                    key={item.id || item.unique_id}
                    className={styles.carouselSlide}
                    style={{ flex: `0 0 ${100 / getVisibleCount()}%` }}
                  >
                    <div className={styles.card}>
                      <div className={styles.quoteIcon}>
                        <i className="bi bi-quote" />
                      </div>
                      <div className={styles.stars}>{renderStars(item.rating)}</div>
                      <p className={styles.message}>{item.message}</p>
                      <div className={styles.author}>
                        <div className={styles.avatar}>
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt={item.name} />
                          ) : (
                            getInitials(item.name)
                          )}
                        </div>
                        <div className={styles.authorInfo}>
                          <p className={styles.authorName}>{item.name}</p>
                          {item.location && (
                            <p className={styles.authorLocation}>
                              <i className="bi bi-geo-alt-fill me-1" />
                              {item.location}
                            </p>
                          )}
                        </div>
                        <span className={styles.categoryBadge}>{item.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            {showControls && (
              <button className={styles.carouselNext} onClick={goNext} aria-label="Next">
                <i className="bi bi-chevron-right" />
              </button>
            )}

            {/* Dots */}
            {showControls && (
              <div className={styles.carouselDots}>
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="bi bi-chat-heart" />
            </div>
            <p>No testimonials in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialSection;
