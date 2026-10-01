import { useTranslation } from 'react-i18next';

function Home() {
  const [t] = useTranslation("global");

  return (
    <div className="window-pane">
      <h2>{t("header.projects")}</h2>
      <p>Sección de Proyectos en construcción...</p>
    </div>
  );
}

export default Home;