import React, { useEffect } from 'react';
import AboutHero from '../../components/AboutHero/AboutHero';
import AboutFeatures from '../../components/AboutFeatures/AboutFeatures';
import AboutTeam from '../../components/AboutTeam/AboutTeam';
import AboutWhyChoose from '../../components/AboutWhyChoose/AboutWhyChoose';
import './About.css';

export default function About() {
  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page fade-in">
      <AboutHero />
      <AboutFeatures />
      <AboutTeam />
      <AboutWhyChoose />
    </div>
  );
}
