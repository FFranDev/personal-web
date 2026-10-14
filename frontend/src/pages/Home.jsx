import { useTranslation } from 'react-i18next';
import './Home.css';

import presentationImage from '../assets/presentation_pic.png';

import logoXeridia from '../assets/experience/logo_xeridia.png';
import logoRestauration from '../assets/experience/logo_restauration.svg';
import logoEstalmat from '../assets/experience/logo_estalmat.png';

// Stack technologies data
const stackData = [
  { name: "Java", level: 3, descKey: "java" },
  { name: "Spring Boot", level: 3, descKey: "spring" },
  { name: ".NET (C#)", level: 3, descKey: "dotnet" },
  { name: "SQL", level: 3, descKey: "sql" },
  { name: "Docker", level: 3, descKey: "docker" },
  
  { name: "React", level: 2, descKey: "react" },
  { name: "TypeScript / JS", level: 2, descKey: "tsjs" },
  { name: "CSS3", level: 2, descKey: "css" },
  { name: "Go", level: 2, descKey: "go" },
  { name: "Agentic AI", level: 2, descKey: "agentic" },
  { name: "Jira", level: 2, descKey: "jira" },
  { name: "Git", level: 2, descKey: "git" },
  
  { name: "Python", level: 1, descKey: "python" },
  { name: "C", level: 1, descKey: "c" }
];

// Helper array to generate stack columns dynamically
const stackLevels = [
  { level: 3, titleKey: "level_expert" },
  { level: 2, titleKey: "level_advanced" },
  { level: 1, titleKey: "level_competent" }
];

// Experience data
const experienceData = [
  { 
    id: "xeridia", 
    company: "Xeridia", 
    logoImg: logoXeridia,
    tech: ["JavaScript", "Jira", "Atlassian SDK", "SQL"] 
  },
  { 
    id: "restauracion", 
    company: "Cadena de Restauración", 
    logoImg: logoRestauration,
    tech: [] 
  },
  {
    id: "estalmat",
    company: "Programa ESTALMAT",
    logoImg: logoEstalmat,
    tech: []
  }
];

// Component to display each technology badge with its level
function TechBadge({ name, level, description }) {
  return (
    <div className="tech-tag" data-description={description}>
      <span className="tech-name">{name}</span>
      <div className="tech-level">
        <span className={`level-block ${level >= 1 ? 'filled' : 'empty'}`}></span>
        <span className={`level-block ${level >= 2 ? 'filled' : 'empty'}`}></span>
        <span className={`level-block ${level >= 3 ? 'filled' : 'empty'}`}></span>
      </div>
    </div>
  );
}

// Reusable ExperienceCard Component
function ExperienceCard({ company, role, date, description, logoImg, tech }) {
  return (
    <div className="experience-card">
      <div className="exp-logo-container">
        <img src={logoImg} alt={`${company} logo`} className="exp-logo" />
      </div>
      <div className="exp-details">
        <h3 className="exp-role">{role}</h3>
        <div className="exp-header">
          <span className="exp-company">{company}</span>
          <span className="exp-date">{date}</span>
        </div>
        <p className="exp-desc">{description}</p>
        
        {tech && tech.length > 0 && (
          <div className="exp-tech-tags">
            {tech.map((item, index) => (
              <span key={index} className="mini-tag">{item}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [t] = useTranslation("global");

  return (
    <div className="window-pane">
      <div className="page-container">
        
        {/* Profile Panel */}
        <section className="panel profile-panel">
          <div className="profile-text">
            <h2 className="section-title">{t("home.greeting")}</h2>
            <p>{t("home.bioParagraph1")}</p>
            <p>{t("home.bioParagraph2")}</p>
            <p>{t("home.bioParagraph3")}</p>
          </div>
          <div className="profile-image-container">
            <div className="placeholder-image">
              <img src={presentationImage} alt="Presentation Image" className="profile-image" />
            </div>
          </div>
        </section>

        {/* Experience Panel */}
        <section className="panel experience-panel">
          <h2 className="section-title">{t("home.experienceTitle")}</h2>
          <p>{t("home.experienceIntroText")}</p>

          <div className="experience-list-container">
            {experienceData.map((exp) => (
              <ExperienceCard 
                key={exp.id}
                company={t(`home.exp_${exp.id}_company`)} 
                role={t(`home.exp_${exp.id}_role`)}
                date={t(`home.exp_${exp.id}_date`)}
                description={t(`home.exp_${exp.id}_desc`)}
                logoImg={exp.logoImg}
                tech={exp.tech}
              />
            ))}
          </div>
        </section>

        {/* Stack Panel */}
        <section className="panel stack-panel">
          <h2 className="section-title">{t("home.stackTitle")}</h2>
          <div className="stack-columns">
            {stackLevels.map((lvl) => (
              <div className="level-group" key={lvl.level}>
                <div className="level-title">[ Nivel: {t(`home.${lvl.titleKey}`)} ]</div>
                {stackData
                  .filter((tech) => tech.level === lvl.level)
                  .map((tech, index) => {
                    const translationKey = `home.tech_${tech.descKey}_desc`;
                    const translatedText = t(translationKey);
                    const finalDescription = translatedText !== translationKey ? translatedText : undefined;
                    return (
                      <TechBadge 
                        key={index} 
                        name={tech.name} 
                        level={tech.level} 
                        description={finalDescription}
                      />
                    );
                  })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;