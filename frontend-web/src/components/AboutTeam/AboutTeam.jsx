import React from 'react';
import membersData from '../../data/members.json';

// Helper to determine styling based on role or badge
const getRoleStyle = (badge) => {
  switch(badge.toUpperCase()) {
    case 'PM':
      return { bg: '#FEF3C7', color: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#B45309' };
    case 'FE':
    case 'FRONTEND':
      return { bg: '#E0E7FF', color: '#4F46E5', badgeBg: '#E0E7FF', badgeColor: '#4338CA' };
    case 'BE':
    case 'BACKEND':
      return { bg: '#DCFCE7', color: '#16A34A', badgeBg: '#DCFCE7', badgeColor: '#15803D' };
    case 'DESIGNER':
    case 'DESIGN':
      return { bg: '#FCE7F3', color: '#DB2777', badgeBg: '#FCE7F3', badgeColor: '#BE185D' };
    case 'DATA':
      return { bg: '#F3E8FF', color: '#9333EA', badgeBg: '#F3E8FF', badgeColor: '#7E22CE' };
    case 'DEVOPS':
      return { bg: '#E0F2FE', color: '#0284C7', badgeBg: '#E0F2FE', badgeColor: '#0369A1' };
    default:
      return { bg: '#F3F4F6', color: '#4B5563', badgeBg: '#F3F4F6', badgeColor: '#374151' };
  }
};

export default function AboutTeam() {
  return (
    <section className="about-team">
      <div className="container">
        <h2 className="about-section-title">
          <span>Đội ngũ phát triển</span>
        </h2>
        
        <div className="team-grid">
          {membersData.map((member, idx) => {
            const styles = getRoleStyle(member.badge);
            
            return (
              <div className="team-card" key={idx}>
                <div className="team-card__avatar-wrapper" style={{ backgroundColor: styles.bg }}>
                  <img 
                    className="team-card__avatar-img"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`}
                    alt={member.name}
                  />
                </div>
                <div className="team-card__name">{member.name}</div>
                <div className="team-card__role">{member.role}</div>
                <div 
                  className="team-card__badge"
                  style={{ backgroundColor: styles.badgeBg, color: styles.badgeColor }}
                >
                  {member.badge}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
