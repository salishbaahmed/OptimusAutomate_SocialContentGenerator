import React, { useState } from 'react';
import {
  FaFileLines,
  FaWandMagicSparkles,
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
  FaCalendarDays,
  FaSpinner
} from 'react-icons/fa6';

export default function InputForm({ onSubmit, loading }) {
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState('topic'); // 'topic' | 'brand_description'
  const [platform, setPlatform] = useState('linkedin'); // 'linkedin' | 'twitter' | 'instagram'
  const [mode, setMode] = useState('single'); // 'single' | 'calendar'
  const [days, setDays] = useState(7);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit({ inputText, inputType, platform, mode, days });
  };

  return (
    <form onSubmit={handleSubmit} className="input-form-panel">

      {/* 1. Input Type Toggle */}
      <div className="form-section">
        <label className="section-label">1. Select Input Type</label>
        <div className="tabs-container">
          <button
            type="button"
            onClick={() => setInputType('topic')}
            className={`tab-btn ${inputType === 'topic' ? 'active' : ''}`}
          >
            <FaFileLines className="btn-icon" /> Topic / Keyword
          </button>
          <button
            type="button"
            onClick={() => setInputType('brand_description')}
            className={`tab-btn ${inputType === 'brand_description' ? 'active' : ''}`}
          >
            <FaWandMagicSparkles className="btn-icon" /> Brand Description
          </button>
        </div>
      </div>

      {/* 2. Text Input Area */}
      <div className="form-section">
        <label htmlFor="input-text" className="section-label">
          {inputType === 'topic' ? 'Topic or Keyword' : 'Brand or Product Description'}
        </label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            inputType === 'topic'
              ? 'e.g., The future of AI agent development, Python optimization tips...'
              : 'e.g., OptimusAutomate is an AI-powered process builder that saves businesses 10+ hours a week...'
          }
          className="form-textarea"
          required
        />
      </div>

      {/* 3. Platform + Mode */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="platform-select" className="section-label">
            2. Choose Platform
          </label>
          <div className="select-wrapper">
            <select
              id="platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="select-input"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
              <option value="instagram">Instagram</option>
            </select>
            <div className="select-icon-overlay">
              {platform === 'linkedin' && <FaLinkedin className="platform-icon icon-linkedin" />}
              {platform === 'twitter'   && <FaXTwitter className="platform-icon icon-twitter" />}
              {platform === 'instagram' && <FaInstagram className="platform-icon icon-instagram" />}
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="section-label">3. Choose Mode</label>
          <div className="tabs-container">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`tab-btn ${mode === 'single' ? 'active' : ''}`}
            >
              Single Post
            </button>
            <button
              type="button"
              onClick={() => setMode('calendar')}
              className={`tab-btn ${mode === 'calendar' ? 'active' : ''}`}
            >
              <FaCalendarDays className="btn-icon" /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* 4. Calendar Duration */}
      {mode === 'calendar' && (
        <div className="form-section calendar-settings-area">
          <div className="range-header">
            <label htmlFor="days-input" className="section-label">
              4. Duration (Days)
            </label>
            <span className="days-display-badge">{days} days</span>
          </div>
          <div className="range-controls">
            <input
              id="days-input"
              type="range"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="slider-input"
            />
            <input
              type="number"
              min="1"
              max="30"
              value={days}
              aria-label="Days count input"
              onChange={(e) =>
                setDays(Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1)))
              }
              className="number-input-field"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        type="submit"
        disabled={loading || !inputText.trim()}
        className="generate-submit-btn"
      >
        {loading ? (
          <>
            <FaSpinner className="spinning-anim btn-icon" />
            Generating content...
          </>
        ) : (
          <>
            <FaWandMagicSparkles className="btn-icon" /> Generate Content
          </>
        )}
      </button>
    </form>
  );
}
