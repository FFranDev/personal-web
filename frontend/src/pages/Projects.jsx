import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Projects.css';

import presentationImage from '../assets/presentation_pic.png';

// Projects data structure
const projectsData = [
  {
    id: "cgruleengine",
    githubUrl: "https://github.com/ffernu/CGRuleEngine_TFG",
    tags: ["Java", "Spring Boot", "JUnit"],
    mainImage: presentationImage,
    galleryImages: [presentationImage, presentationImage, presentationImage]
  },
  {
    id: "godotcstoolbox",
    githubUrl: "https://github.com/FFranDev/godot-cs-toolbox",
    tags: ["C#", "Godot", "Test", "Hallo"],
    mainImage: presentationImage,
    galleryImages: [presentationImage, presentationImage]
  },
  {
    id: "personalweb",
    githubUrl: "https://github.com/FFranDev/personal-web",
    tags: ["React", "CSS3", "JavaScript"],
    mainImage: presentationImage,
    galleryImages: [presentationImage, presentationImage, presentationImage]
  }
];

// Reusable component for individual projects
function ProjectCard({ id, githubUrl, mainImage, galleryImages, tags }) {
  const [t] = useTranslation("global");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const galleryRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleGallery = () => {
    setIsGalleryOpen(!isGalleryOpen);
  };

  const moveGallery = (direction) => {
    const newIndex = currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < galleryImages.length) {
      setCurrentImageIndex(newIndex);
    }
  };

  return (
    <div className="panel project-card">
      <div className="project-top">
        <div className="project-info">
          <h3 className="project-title">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              {t(`projects.${id}_title`)} ↗
            </a>
          </h3>
          <div className="mini-tags">
            {tags.map((tag, index) => (
              <span key={index} className="mini-tag">{tag}</span>
            ))}
          </div>
        </div>
        <div className="project-image-wrapper">
          <img 
            src={mainImage} 
            alt={`${t(`projects.${id}_title`)} main capture`} 
            className="main-image" 
          />
        </div>
      </div>
      
      <div className="project-body">
        <p className="project-desc">{t(`projects.${id}_desc`)}</p>
      </div>

      {galleryImages && galleryImages.length > 0 && (
        <div className="project-gallery-wrapper">
          <button className="gallery-toggle-btn" onClick={toggleGallery}>
            {isGalleryOpen ? `[-] ${t("projects.hideGallery")}` : `[+] ${t("projects.showGallery")}`}
          </button>
          
          {isGalleryOpen && (
            <div className="gallery-content">
              <div className="gallery-viewport no-scrollbar" ref={galleryRef}>
                <div 
                  className="gallery-track" 
                  style={{ 
                    transform: isMobile ? 'none' : `translateX(-${currentImageIndex * 100}%)` 
                  }}
                >
                  {galleryImages.map((img, index) => (
                    <img key={index} src={img} alt={`Gallery capture ${index + 1}`} />
                  ))}
                </div>
              </div>
              
              {!isMobile && (
                <div className="gallery-controls">
                  <button 
                    className="btn" 
                    onClick={() => moveGallery(-1)}
                    disabled={currentImageIndex === 0}
                  >
                    &lt; {t("projects.prev")}
                  </button>
                  <button 
                    className="btn" 
                    onClick={() => moveGallery(1)}
                    disabled={currentImageIndex === galleryImages.length - 1}
                  >
                    {t("projects.next")} &gt;
                  </button>
                </div>
              )}
              
              {isMobile && <div className="gallery-counter"></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Projects view
function Projects() {
  const [t] = useTranslation("global");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const scrollContainerRef = useRef(null);
  
  // Track scroll position to conditionally show indicators/buttons
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true
  });

  // Dynamically extract all unique tags from data (excluding 'Todos')
  const dynamicTags = useMemo(() => {
    const tags = new Set();
    projectsData.forEach(project => {
      project.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "Todos") return projectsData;
    return projectsData.filter(project => project.tags.includes(activeFilter));
  }, [activeFilter]);

  // Checks the scroll position of the container
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // 1px tolerance to avoid floating point rounding issues
      setScrollState({
        canScrollLeft: scrollLeft > 1,
        canScrollRight: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1
      });
    }
  };

  // Check scroll initially and on window resize
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [dynamicTags]);

  const scrollFilters = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // Scroll distance in pixels
      scrollContainerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
      // Small timeout to let smooth scroll finish before re-checking
      setTimeout(checkScroll, 350); 
    }
  };

  return (
    <div className="window-pane">
      <div className="page-container">
        
        {/* Intro and Filters Panel */}
        <section className="panel projects-intro">
          <h2 className="section-title">{t("header.projects")}</h2>
          <p>{t("projects.introText")}</p>

          <div className="filters-wrapper">
            <div className="filters-main-row">
              <button
                className={`filter-tag-all ${activeFilter === "Todos" ? 'active' : ''}`}
                onClick={() => setActiveFilter("Todos")}
              >
                {t("projects.filterAll")}
              </button>

              <div className="filters-scroll-window">
                {scrollState.canScrollLeft && <div className="mobile-scroll-indicator left">«</div>}
                
                <div 
                  className="filters-scroll-track no-scrollbar" 
                  ref={scrollContainerRef}
                  onScroll={checkScroll}
                >
                  {dynamicTags.map(tag => (
                    <button
                      key={tag}
                      className={`filter-tag ${activeFilter === tag ? 'active' : ''}`}
                      onClick={() => setActiveFilter(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {scrollState.canScrollRight && <div className="mobile-scroll-indicator right">»</div>}
              </div>
            </div>

            <div className="filters-desktop-controls">
              <button 
                className="btn filter-scroll-btn" 
                onClick={() => scrollFilters(-1)}
                disabled={!scrollState.canScrollLeft}
                aria-label="Scroll left"
              >
                «
              </button>
              <button 
                className="btn filter-scroll-btn" 
                onClick={() => scrollFilters(1)}
                disabled={!scrollState.canScrollRight}
                aria-label="Scroll right"
              >
                »
              </button>
            </div>

          </div>
        </section>

        {/* Filtered Projects List */}
        <section className="projects-list">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              id={project.id}
              githubUrl={project.githubUrl}
              mainImage={project.mainImage}
              galleryImages={project.galleryImages}
              tags={project.tags}
            />
          ))}
        </section>
        
      </div>
    </div>
  );
}

export default Projects;