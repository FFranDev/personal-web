import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import './Header.css';

function Header() {
  const [t, i18n] = useTranslation("global");
  const [isVisible, setIsVisible] = useState(true);
  
  const lastScrollY = useRef(0);
  const nodeRef = useRef(null);

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

          <h1 className="title" style={{ flexGrow: 1, textAlign: "center", margin: "0 20px" }}>
            {t("header.title")}
          </h1>

          <nav className="field-row" style={{ margin: 0 }}>
            <Link to="/"><button className="btn">{t("header.home")}</button></Link>
            <Link to="/projects"><button className="btn">{t("header.projects")}</button></Link>
            <Link to="/blog"><button className="btn">{t("header.blog")}</button></Link>
            <Link to="/contact"><button className="btn">{t("header.contact")}</button></Link>
          </nav>
        </div>
        <div className="separator"></div>
      </header>
    </CSSTransition>
  );
}

export default Header;