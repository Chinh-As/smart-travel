import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{display:'inline',verticalAlign:'middle',marginRight:'6px'}}><path d="M1 9l7-7 7 7M3 7v8h12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Smart Travel
          </div>
          <p>Lên kế hoạch du lịch thông minh — khám phá Việt Nam theo cách của bạn.</p>
          <div className="footer__socials">
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 17V10H6V8h1.5V6.5a2.5 2.5 0 012.5-2.5H12v2h-1.5a1 1 0 00-1 1V8H12l-.5 2H9.5v7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 14.5c1.5 1 3.5 1 5 0s2-3 1.5-5L15 2l-3 1-2-1.5L8 4l-3 1c-1 1-2 3-1 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.3"/><circle cx="14" cy="4" r="1" fill="currentColor"/></svg>
            </a>
          </div>
        </div>
        <div className="footer__col">
          <h4>About us</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/">Features</Link>
          <Link to="/">Careers</Link>
        </div>
        <div className="footer__col">
          <h4>Resources</h4>
          <Link to="/">Help center</Link>
          <Link to="/">Blog</Link>
          <Link to="/">Partnership</Link>
        </div>
        <div className="footer__col footer__newsletter">
          <h4>Get in touch</h4>
          <p>Subscribe to our newsletter</p>
          <div className="footer__form">
            <input type="email" placeholder="Email của bạn" className="field-input" style={{borderRadius:'var(--r-full)'}} />
            <button className="btn btn-purple" style={{padding:'10px 18px'}}>Subscribe</button>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">&copy; 2025 Smart Travel. All rights reserved.</div>
      </div>
    </footer>
  )
}
