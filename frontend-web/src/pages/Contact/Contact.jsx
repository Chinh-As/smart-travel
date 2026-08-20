import React, { useEffect } from 'react';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import './Contact.css';

export default function Contact() {
  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page fade-in">
      <div className="contact-container">
        <ContactForm />
        <ContactInfo />
      </div>
    </div>
  );
}
