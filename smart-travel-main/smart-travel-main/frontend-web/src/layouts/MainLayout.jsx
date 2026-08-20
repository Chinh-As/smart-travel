import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer/Footer.jsx'
import ChatBot from '../components/ChatBot/ChatBot.jsx'
import './MainLayout.css'

export default function MainLayout() {
  const [chatOpen, setChatOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={`main-layout ${isHome ? 'main-layout--home' : ''}`}>
      <Header onChatOpen={() => setChatOpen(true)} />
      <main className="main-layout__content">
        <Outlet />
      </main>
      <Footer />
      <button className="fab-chat" onClick={() => setChatOpen(true)} aria-label="Hỏi AI">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 1C5.5 1 1 4.8 1 9.5c0 2.7 1.6 5 4 6.5L4 21l4.5-2.5c.8.2 1.6.3 2.5.3 5.5 0 10-3.8 10-8.5S16.5 1 11 1z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="9.5" r="1" fill="white"/>
          <circle cx="11" cy="9.5" r="1" fill="white"/>
          <circle cx="15" cy="9.5" r="1" fill="white"/>
        </svg>
        <span className="fab-chat__dot" />
      </button>
      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
    </div>
  )
}
