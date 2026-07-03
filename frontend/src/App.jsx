import React, { useState } from 'react';
import { Sparkles, Megaphone, HelpCircle } from 'lucide-react';
import InputForm from './components/InputForm';
import PostCard from './components/PostCard';
import CalendarView from './components/CalendarView';
import { generateContent } from './api';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // single post object OR calendar posts array
  const [error, setError] = useState(null);
  
  // Track parameters of the current successful generation
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [currentMode, setCurrentMode] = useState('');

  const handleGenerate = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await generateContent(formData);
      setResult(data);
      setCurrentPlatform(formData.platform);
      setCurrentMode(formData.mode);
    } catch (err) {
      setError(err.message || 'Failed to generate social media content.');
    } finally {
      setLoading(false);
    }
  };

  // Inline post-update function when regenerating/refining a post card
  const handleUpdatePost = (index, newText, newHashtags) => {
    if (currentMode === 'single') {
      setResult((prev) => ({
        ...prev,
        post_text: newText,
        hashtags: newHashtags,
      }));
    } else {
      setResult((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          post_text: newText,
          hashtags: newHashtags,
        };
        return updated;
      });
    }
  };

  return (
    <div className="app-container">
      {/* Background decoration elements */}
      <div className="bg-glow bg-glow-violet"></div>
      <div className="bg-glow bg-glow-indigo"></div>

      {/* Main Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="app-title">Social Content Generator</h1>
            <p className="app-tagline">AI-Powered Social Media Management Suite</p>
          </div>
        </div>
        <div className="badge-internship">
          AI Content Studio
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="dashboard-grid">
        {/* Left Side: Input Form */}
        <section className="form-column">
          <InputForm onSubmit={handleGenerate} loading={loading} />
        </section>

        {/* Right Side: Result Display */}
        <section className="result-column">
          {loading && (
            <div className="status-container animate-pulse">
              <div className="generation-loader">
                <div className="spinner-glow"></div>
                <Sparkles size={32} className="spinning-sparkle" />
              </div>
              <h3 className="status-title">Generating content ideas...</h3>
              <p className="status-desc">
                Consulting Groq Llama-3.3 model to craft high-impact copywriting.
              </p>
            </div>
          )}

          {error && (
            <div className="status-container error-container">
              <div className="error-icon-box">⚠️</div>
              <h3 className="status-title error-title">Generation Error</h3>
              <p className="status-desc error-desc">{error}</p>
              <p className="error-troubleshoot">
                Ensure the FastAPI backend is running and that a valid GROQ_API_KEY is configured in your <code>backend/.env</code> file.
              </p>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="status-container empty-container">
              <div className="empty-icon-box">
                <Sparkles size={32} />
              </div>
              <h3 className="status-title">Ready for generation</h3>
              <p className="status-desc">
                Fill in the details on the left, choose your target platform, and generate professional posts or calendars instantly.
              </p>
              <div className="quick-tips">
                <div className="tip-item">
                  <span className="tip-number">1</span>
                  <span>LinkedIn posts auto-optimize for professional thought-leadership.</span>
                </div>
                <div className="tip-item">
                  <span className="tip-number">2</span>
                  <span>Twitter posts remain strictly under X's character limit.</span>
                </div>
                <div className="tip-item">
                  <span className="tip-number">3</span>
                  <span>Calendar mode creates a daily narrative arc.</span>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && result && (
            <div className="result-viewer animate-fade-in">
              {currentMode === 'single' ? (
                <div className="single-post-wrapper">
                  <div className="result-view-header">
                    <h2 className="calendar-main-title">Generated Social Post</h2>
                    <p className="calendar-subtitle">
                      Copy-ready copywriting for your brand/topic
                    </p>
                  </div>
                  <PostCard
                    postText={result.post_text}
                    hashtags={result.hashtags}
                    platform={currentPlatform}
                    imagePrompt={result.image_prompt || ''}
                    onUpdate={(newText, newHashtags) => handleUpdatePost(0, newText, newHashtags)}
                  />
                </div>
              ) : (
                <CalendarView
                  posts={result}
                  platform={currentPlatform}
                  onUpdatePost={handleUpdatePost}
                />
              )}
            </div>
          )}
        </section>
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 Social Media Content Generator. Developed with Groq & React.</p>
      </footer>
    </div>
  );
}
