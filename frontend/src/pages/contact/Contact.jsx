import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Contact.css';

const MAX_MESSAGE_LENGTH = 1500;

function Contact() {
  const [t] = useTranslation("global");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '' // Honeypot field
  });

  const handleChange = (e) => {
    const { name, value, maxLength } = e.target;
    
    // Enforce maxLength in state even on copy-paste
    const finalValue = maxLength > 0 ? value.slice(0, maxLength) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TEMP: Backend integration will be added here once visual layout is approved
    console.log("Form submitted:", formData);
  };

  return (
    <div className="window-pane">
      <div className="page-container">
        
        {/* Intro and Direct Contact Links Panel */}
        <section className="panel contact-intro">
          <h2 className="section-title">{t("contact.greeting")}</h2>
          <p>{t("contact.introText1")}</p>
          <p>{t("contact.introText2")}</p>

          <div className="contact-links">
            <a 
              href="https://www.linkedin.com/in/francisco-fern%C3%A1ndez-ugidos-aa687a384" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn contact-link-btn"
            >
              {t("contact.linkedInBtn")} ↗
            </a>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=franferug@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn contact-link-btn"
            >
              {t("contact.emailBtn")} ↗
            </a>
            <a 
              href="/FranciscoFernándezUgidos_CV.pdf" 
              download 
              className="btn contact-link-btn"
            >
              {t("contact.cvBtn")} ↓
            </a>
          </div>
        </section>

        {/* Direct Email Form Panel */}
        <section className="panel contact-form-panel">
          <h2 className="section-title">{t("contact.formTitle")}</h2>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t("contact.labelName")}</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="contact-input"
                  placeholder={t("contact.placeholderName")}
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t("contact.labelEmail")}</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="contact-input"
                  placeholder={t("contact.placeholderEmail")}
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={150}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">{t("contact.labelSubject")}</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                className="contact-input"
                placeholder={t("contact.placeholderSubject")}
                value={formData.subject}
                onChange={handleChange}
                maxLength={150}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">{t("contact.labelMessage")}</label>
              <div className="textarea-wrapper">
                <textarea 
                  id="message" 
                  name="message" 
                  className="contact-textarea"
                  placeholder={t("contact.placeholderMessage")}
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={MAX_MESSAGE_LENGTH}
                  required
                />
                <span className="char-counter">
                  {formData.message.length} / {MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            {/* Hidden honeypot field */}
            <div className="honeypot-field" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input 
                type="text" 
                id="website" 
                name="website" 
                value={formData.website}
                onChange={handleChange}
                tabIndex="-1" 
                autoComplete="off" 
              />
            </div>

            <div className="form-footer">
              <button type="submit" className="btn submit-btn">
                {t("contact.submitBtn")} »
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}

export default Contact;