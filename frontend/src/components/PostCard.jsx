import React, { useState } from 'react';
import {
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
  FaRotate,
  FaRegCopy,
  FaCheck,
  FaSpinner,
  FaPaperPlane,
  FaRegImage
} from 'react-icons/fa6';
import { regenerateContent } from '../api';

export default function PostCard({ postText, hashtags, platform, dayNumber, imagePrompt, onUpdate }) {
  const [copied, setCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Image state
  const [imgSeed, setImgSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Build Pollinations.ai URL — only when imagePrompt is available
  const imageUrl = imagePrompt
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true&seed=${imgSeed}`
    : null;

  const handleRegenerateImage = () => {
    // New random seed → new image for the same prompt
    setImgSeed(Math.floor(Math.random() * 1000000));
    setImgLoaded(false);
    setImgError(false);
  };

  const handleCopy = async () => {
    try {
      let fullText = postText;
      const hasTagsAlready = hashtags.every(tag =>
        postText.toLowerCase().includes(`#${tag.toLowerCase()}`)
      );
      if (!hasTagsAlready && hashtags.length > 0) {
        fullText += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
      }
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRefineSubmit = async (e) => {
    e.preventDefault();
    if (!refineInstructions.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await regenerateContent({
        originalPost: postText,
        platform,
        refineInstructions,
      });

      if (onUpdate) {
        onUpdate(result.post_text, result.hashtags);
      }

      setRefineInstructions('');
      setIsRefining(false);
    } catch (err) {
      setError(err.message || 'Failed to refine post.');
    } finally {
      setLoading(false);
    }
  };

  const PlatformIcon = {
    linkedin: FaLinkedin,
    twitter: FaXTwitter,
    x: FaXTwitter,
    instagram: FaInstagram,
  }[platform.toLowerCase()];

  return (
    <div className="post-card">
      <div className="card-top-wrapper">

        {/* ── AI-Generated Image ── */}
        {imageUrl && (
          <div className="post-card-image-container">
            {/* Skeleton shown while image loads */}
            {!imgLoaded && !imgError && (
              <div className="post-card-image-skeleton">
                <span className="skeleton-icon"><FaRegImage /></span>
                <span className="skeleton-label">Generating image…</span>
              </div>
            )}

            {imgError && (
              <div className="post-card-image-error">
                ⚠️ Image failed to load
              </div>
            )}

            <img
              src={imageUrl}
              alt={imagePrompt}
              className="post-card-image"
              style={{ display: imgLoaded ? 'block' : 'none' }}
              onLoad={() => { setImgLoaded(true); setImgError(false); }}
              onError={() => { setImgError(true); setImgLoaded(false); }}
            />

            {/* Regenerate image button — visible once loaded or after error */}
            {(imgLoaded || imgError) && (
              <button
                onClick={handleRegenerateImage}
                className="regenerate-image-btn"
                title="Get a different image for the same prompt"
              >
                <FaRotate className="btn-icon-sm" /> New Image
              </button>
            )}
          </div>
        )}

        {/* Card Header */}
        <div className="card-header">
          <div className="platform-meta">
            <div className={`icon-badge ${platform.toLowerCase()}-badge`}>
              {PlatformIcon ? (
                <PlatformIcon style={{ fontSize: '1.1rem' }} />
              ) : (
                <span style={{ fontSize: '1.1rem' }}>📣</span>
              )}
            </div>
            <div>
              <h3 className="platform-title">{platform}</h3>
              <p className="day-label">
                {dayNumber !== undefined ? `Day ${dayNumber}` : 'Single Post'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            title="Copy to Clipboard"
            className={`action-btn-copy ${copied ? 'copy-success' : ''}`}
          >
            {copied ? <FaCheck /> : <FaRegCopy />}
          </button>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <div className="post-text-content">{postText}</div>

          {hashtags && hashtags.length > 0 && (
            <div className="card-hashtags-block">
              {hashtags.map((tag, idx) => (
                <span key={idx} className="hashtag-pill">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer / Refine Drawer */}
      <div className="card-footer">
        {!isRefining ? (
          <button onClick={() => setIsRefining(true)} className="refine-trigger-btn">
            <FaRotate className="btn-icon" /> Refine Post
          </button>
        ) : (
          <form onSubmit={handleRefineSubmit} className="refine-form">
            <div className="refine-form-header">
              <label
                htmlFor={`refine-input-${dayNumber || 'single'}`}
                className="refine-label"
              >
                Refinement Instructions
              </label>
              <button
                type="button"
                aria-label="Cancel refinement"
                onClick={() => { setIsRefining(false); setError(null); }}
                className="close-refine-btn"
              >
                ✕
              </button>
            </div>

            <div className="refine-input-container">
              <input
                id={`refine-input-${dayNumber || 'single'}`}
                type="text"
                value={refineInstructions}
                onChange={(e) => setRefineInstructions(e.target.value)}
                placeholder="e.g. make it shorter, more formal, add jokes"
                disabled={loading}
                className="refine-input-field"
                required
              />
              <button
                type="submit"
                disabled={loading || !refineInstructions.trim()}
                aria-label="Submit refinement"
                className="refine-send-btn"
              >
                {loading ? (
                  <FaSpinner className="spinning-anim" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>

            {error && <p className="refine-error-message">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
