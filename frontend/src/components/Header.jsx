import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import { useTypewriter } from '../hooks/useTypewriter';
import './Header.css';

function Header() {
  const [t, i18n] = useTranslation("global");
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  
  const lastScrollY = useRef(0);
  const nodeRef = useRef(null);

  const baseText = t("header.titleBase");
  const suffixes = t("header.titleSuffixes", { returnObjects: true });

  // Add suffixes to the base text for the typewriter effect
  const typingText = useTypewriter(baseText, suffixes);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <CSSTransition
      in={isVisible}
      nodeRef={nodeRef}
      timeout={300}
      classNames="header-slide"
    >
      <header ref={nodeRef} className="fixed-header">
        <div 
          className="title-bar" 
          style={{ 
            minHeight: "70px", 
            padding: "10px 15px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between" 
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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

          <h1 className="header-title" style={{ flexGrow: 1, margin: "0 500px" }}>
            {typingText}
          </h1>

          <nav className="field-row" style={{ margin: 0, display: "flex", gap: "8px" }}>
            <Link to="/" style={{ pointerEvents: location.pathname === '/' ? 'none' : 'auto' }} tabIndex={-1}>
              <button className={`btn nav-btn ${location.pathname === '/' ? 'active' : ''}`}>
                {t("header.home")}
              </button>
            </Link>
            <Link to="/projects" style={{ pointerEvents: location.pathname === '/projects' ? 'none' : 'auto' }} tabIndex={-1}>
              <button className={`btn nav-btn ${location.pathname === '/projects' ? 'active' : ''}`}>
                {t("header.projects")}
              </button>
            </Link>
            <Link to="/blog" style={{ pointerEvents: location.pathname === '/blog' ? 'none' : 'auto' }} tabIndex={-1}>
              <button className={`btn nav-btn ${location.pathname === '/blog' ? 'active' : ''}`}>
                {t("header.blog")}
              </button>
            </Link>
            <Link to="/contact" style={{ pointerEvents: location.pathname === '/contact' ? 'none' : 'auto' }} tabIndex={-1}>
              <button className={`btn nav-btn ${location.pathname === '/contact' ? 'active' : ''}`}>
                {t("header.contact")}
              </button>
            </Link>
          </nav>
        </div>
        <div className="separator"></div>
      </header>
    </CSSTransition>
  );
}

export default Header;