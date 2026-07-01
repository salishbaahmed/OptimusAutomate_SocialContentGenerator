import React from 'react';
import PostCard from './PostCard';

export default function CalendarView({ posts, platform, onUpdatePost }) {
  if (!posts || posts.length === 0) return null;

  const sortedPosts = [...posts].sort((a, b) => (a.day || 0) - (b.day || 0));

  return (
    <div className="calendar-view-container">
      <div className="calendar-header-section">
        <div>
          <h2 className="calendar-main-title">Generated Content Calendar</h2>
          <p className="calendar-subtitle">
            A planned {posts.length}-day campaign custom-tuned for {platform.capitalize()}
          </p>
        </div>
        <div className="calendar-badge-count">
          {posts.length} Posts Plan
        </div>
      </div>

      <div className="posts-grid-layout">
        {sortedPosts.map((post, idx) => (
          <PostCard
            key={post.day || idx}
            dayNumber={post.day}
            postText={post.post_text}
            hashtags={post.hashtags || []}
            platform={platform}
            imagePrompt={post.image_prompt || ''}
            onUpdate={(newText, newHashtags) => onUpdatePost(idx, newText, newHashtags)}
          />
        ))}
      </div>
    </div>
  );
}

if (!String.prototype.capitalize) {
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
}
