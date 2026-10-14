import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import { useTypewriter } from '../../hooks/useTypewriter';
import logoIcon from '../../assets/logo.svg';
import './Header.css';

function Header() {
  const [t, i18n] = useTranslation("global");
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  
  const location = useLocation();
  const lastScrollY = useRef(0);
  const nodeRef = useRef(null);
  const navRef = useRef(null); // Reference for the scrolling navigation container

  const baseText = t("header.titleBase");
  const suffixes = t("header.titleSuffixes", { returnObjects: true });

  const typingText = useTypewriter(baseText, suffixes, 150, 50, 3000);

  // Handle window resize to determine if it's mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1000);
      if (window.innerWidth > 1000) {
        setIsMobileMenuOpen(false); 
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
        setIsMobileMenuOpen(false); 
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll position when mobile menu is opened
  useEffect(() => {
    if (isMobileMenuOpen && navRef.current) {
      navRef.current.scrollLeft = 0;
    }
  }, [isMobileMenuOpen]);

  // Updates the document title based on the current page and language
  useEffect(() => {
    let pageName = "";
    
    switch (location.pathname) {
      case "/":
        pageName = t("header.home");
        break;
      case "/projects":
        pageName = t("header.projects");
        break;
      case "/blog":
        pageName = t("header.blog");
        break;
      case "/contact":
        pageName = t("header.contact");
        break;
      default:
        pageName = "";
    }
    document.title = pageName ? `FranFdez - ${pageName}` : "FranFdez";
    
  }, [location.pathname, t]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Determine which title to display based on device type
  const displayText = isMobile ? baseText : typingText;

  return (
    <CSSTransition
      in={isVisible}
      nodeRef={nodeRef}
      timeout={300}
      classNames="header-slide"
    >
      <header ref={nodeRef} className="fixed-header">
        <div className="title-bar">

          <div className="title-wrapper">
            <img src={logoIcon} alt="Icon" className="header-logo" />
            <h1 className="header-title">
              {displayText}
            </h1>
          </div>

          <div className="controls-container">
            <button 
              className={`btn hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>

            <nav ref={navRef} className={`field-row header-nav ${isMobileMenuOpen ? 'open' : ''}`}>
              <div className="lang-buttons">
                <button 
                  className={`btn ${i18n.language === 'es' ? 'active' : ''}`} 
                  onClick={() => changeLanguage("es")}
                >
                  ES
                </button>
                <button 
                  className={`btn ${i18n.language === 'en' ? 'active' : ''}`} 
                  onClick={() => changeLanguage("en")}
                >
                  EN
                </button>
              </div>

              <Link to="/" className={location.pathname === '/' ? 'disabled-link' : ''} tabIndex={-1}>
                <button className={`btn nav-btn ${location.pathname === '/' ? 'active' : ''}`}>
                  {t("header.home")}
                </button>
              </Link>
              <Link to="/projects" className={location.pathname === '/projects' ? 'disabled-link' : ''} tabIndex={-1}>
                <button className={`btn nav-btn ${location.pathname === '/projects' ? 'active' : ''}`}>
                  {t("header.projects")}
                </button>
              </Link>
              <Link to="/blog" className={location.pathname === '/blog' ? 'disabled-link' : ''} tabIndex={-1}>
                <button className={`btn nav-btn ${location.pathname === '/blog' ? 'active' : ''}`}>
                  {t("header.blog")}
                </button>
              </Link>
              <Link to="/contact" className={location.pathname === '/contact' ? 'disabled-link' : ''} tabIndex={-1}>
                <button className={`btn nav-btn ${location.pathname === '/contact' ? 'active' : ''}`}>
                  {t("header.contact")}
                </button>
              </Link>
            </nav>
          </div>

        </div>
        <div className="separator"></div>
      </header>
    </CSSTransition>
  );
}

export default Header;