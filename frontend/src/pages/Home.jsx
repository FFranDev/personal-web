import { useTranslation } from 'react-i18next';
import './Home.css';
import presentationImage from '../assets/presentation_pic.png';

// Stack technologies data
const stackData = [
  { name: "React", level: 3, levelKey: "expert" },
  { name: "JavaScript", level: 2, levelKey: "advanced" },
  { name: "CSS3", level: 2, levelKey: "advanced" },
  { name: "Node.js", level: 1, levelKey: "competent" },
  { name: "Git", level: 2, levelKey: "advanced" }
];

// Component to display each technology badge with its level
function TechBadge({ name, level, title }) {
  return (
    <div className="tech-tag" title={title}>
      <span className="tech-name">{name}</span>
      <div className="tech-level">
        <span className={`level-block ${level >= 1 ? 'filled' : 'empty'}`}></span>
        <span className={`level-block ${level >= 2 ? 'filled' : 'empty'}`}></span>
        <span className={`level-block ${level >= 3 ? 'filled' : 'empty'}`}></span>
      </div>
    </div>
  );
}

function Home() {
  const [t] = useTranslation("global");

  return (
    <div className="window-pane">
      <div className="home-content">
        
        <section className="panel profile-panel">
          <div className="profile-text">
            <h2>{t("home.greeting")}</h2>
            <p>{t("home.bioParagraph1")}</p>
            <p>{t("home.bioParagraph2")}</p>
          </div>
          <div className="profile-image-container">
            <div className="placeholder-image">
              <img src={presentationImage} alt="Presentation Image" className="profile-image" />
            </div>
          </div>
        </section>

        <section className="panel experience-panel">
          <h2>{t("home.experienceTitle")}</h2>
          <p>{t("home.experienceIntro")}</p>
          <ul className="experience-list">
            <li>{t("home.experienceItem1")}</li>
            <li>{t("home.experienceItem2")}</li>
            <li>{t("home.experienceItem3")}</li>
          </ul>
        </section>

        <section className="panel stack-panel">
          <h2>{t("home.stackTitle")}</h2>
          <div className="stack-tags">
            {stackData.map((tech, index) => (
              <TechBadge 
                key={index} 
                name={tech.name} 
                level={tech.level} 
                title={t(`home.level_${tech.levelKey}`)}
              />
            ))}

          </div>
        </section>

      </div>
    </div>
  );
}

export default Home;