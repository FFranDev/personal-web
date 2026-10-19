import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './Blog.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const ADMIN_TOKEN_KEY = 'blog_admin_token';
const POSTS_PER_PAGE = 5;
const MAX_COMMENT_LENGTH = 600;

// Builds fixed-max-4-buttons pagination array (e.g. [1, 2, 3, '...', 8] or [1, '...', 6, 7, 8])
function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the start (pages 1, 2) -> show first 3 + last
  if (currentPage <= 2) {
    return [1, 2, 3, '...', totalPages];
  }

  // Near the end (last 2 pages) -> show first + last 3
  if (currentPage >= totalPages - 1) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // Middle pages (e.g. page 4 of 8 -> 2, 3, 4, '...', 8)
  return [currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

function PaginationNumbers({ currentPage, totalPages, onSelectPage }) {
  const items = useMemo(() => getPaginationItems(currentPage, totalPages), [currentPage, totalPages]);

  return (
    <div className="pagination-window">
      {items.map((item, index) =>
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
        ) : (
          <button
            key={item}
            type="button"
            className={`btn page-num-btn ${currentPage === item ? 'active' : ''}`}
            onClick={() => onSelectPage(item)}
          >
            {item}
          </button>
        )
      )}
    </div>
  );
}

function PaginationArrows({ currentPage, totalPages, onSelectPage }) {
  return (
    <div className="pagination-arrows">
      <button
        type="button"
        className="btn page-arrow-btn"
        disabled={currentPage <= 1}
        onClick={() => onSelectPage(currentPage - 1)}
        aria-label="Previous page"
      >
        «
      </button>
      <button
        type="button"
        className="btn page-arrow-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onSelectPage(currentPage + 1)}
        aria-label="Next page"
      >
        »
      </button>
    </div>
  );
}

function PostGallery({ images, postTitle }) {
  const [t] = useTranslation("global");
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  const moveGallery = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const swipeThreshold = 50;

    if (diffX > swipeThreshold) moveGallery(1);
    else if (diffX < -swipeThreshold) moveGallery(-1);

    touchStartX.current = null;
  };

  const currentImageUrl = images[currentIndex] || '';
  const resolvedImageSrc = currentImageUrl.startsWith('http')
    ? currentImageUrl
    : `${API_BASE_URL}${currentImageUrl}`;

  return (
    <div className="blog-gallery-wrapper">
      <div
        className="gallery-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={resolvedImageSrc}
          alt={`${postTitle} capture ${currentIndex + 1}`}
          className="gallery-image"
        />
      </div>

      {images.length > 1 && (
        <>
          <div className="gallery-controls">
            <button
              type="button"
              className="btn page-arrow-btn"
              onClick={() => moveGallery(-1)}
              disabled={currentIndex === 0}
            >
              «
            </button>
            <button
              type="button"
              className="btn page-arrow-btn"
              onClick={() => moveGallery(1)}
              disabled={currentIndex === images.length - 1}
            >
              »
            </button>
          </div>
          <div className="gallery-counter">
            {`« ${t("projects.gallerySwipeMobile")} (${currentIndex + 1}/${images.length}) »`}
          </div>
        </>
      )}
    </div>
  );
}

function CommentSection({ postId, comments, isAdmin, onAddComment, onDeleteComment }) {
  const [t] = useTranslation("global");
  const [isOpen, setIsOpen] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [visitorForm, setVisitorForm] = useState({ authorName: '', text: '', website: '' });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    if (!submitStatus) return;

    const timer = setTimeout(() => {
      setSubmitStatus(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [submitStatus]);

  const rootComments = useMemo(() => comments.filter(c => !c.parentId), [comments]);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  const handleVisitorChange = (e) => {
    const { name, value, maxLength } = e.target;
    const finalValue = maxLength > 0 ? value.slice(0, maxLength) : value;
    setVisitorForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingComment) return;

    if (visitorForm.website) {
      setSubmitStatus('success');
      setVisitorForm({ authorName: '', text: '', website: '' });
      return;
    }

    setIsSubmittingComment(true);
    setSubmitStatus(null);

    const status = await onAddComment(postId, {
      authorName: isAdmin ? "Fran" : visitorForm.authorName.trim(),
      text: visitorForm.text.trim(),
      parentId: null,
      website: visitorForm.website
    });

    setIsSubmittingComment(false);
    setSubmitStatus(status);

    if (status === 'success') {
      setVisitorForm({ authorName: '', text: '', website: '' });
    }
  };

  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    if (isSubmittingComment) return;

    setIsSubmittingComment(true);
    const status = await onAddComment(postId, {
      authorName: "Fran",
      text: replyText.trim(),
      parentId: parentCommentId,
      website: ''
    });
    setIsSubmittingComment(false);

    if (status === 'success') {
      setReplyText('');
      setReplyingToId(null);
    }
  };

  return (
    <div className="blog-comments-wrapper">
      <button
        type="button"
        className="comments-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen
          ? `[-] ${t("blog.hideComments")} (${comments.length})`
          : `[+] ${t("blog.showComments")} (${comments.length})`}
      </button>

      {isOpen && (
        <div className="comments-content">
          {rootComments.length === 0 ? (
            <p className="no-comments-msg">{t("blog.noComments")}</p>
          ) : (
            <div className="comments-list">
              {rootComments.map(comment => {
                const replies = getReplies(comment.id);
                return (
                  <div key={comment.id} className="comment-thread">
                    <div className="comment-item">
                      <div className="comment-header">
                        <div className="comment-author-group">
                          <span>{comment.authorName}</span>
                          {comment.isAuthor && <span className="author-badge">{t("blog.authorBadge")}</span>}
                        </div>
                        <div className="comment-actions">
                          <span>{comment.createdAt}</span>
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                className="btn admin-action-btn"
                                onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                              >
                                {t("blog.replyBtn")}
                              </button>
                              <button
                                type="button"
                                className="btn admin-action-btn"
                                onClick={() => onDeleteComment(postId, comment.id)}
                              >
                                [X]
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>

                    {replies.map(reply => (
                      <div key={reply.id} className="comment-reply-wrapper">
                        <div className="reply-connector"></div>
                        <div className="comment-item">
                          <div className="comment-header">
                            <div className="comment-author-group">
                              <span>{reply.authorName}</span>
                              {reply.isAuthor && <span className="author-badge">{t("blog.authorBadge")}</span>}
                            </div>
                            <div className="comment-actions">
                              <span>{reply.createdAt}</span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  className="btn admin-action-btn"
                                  onClick={() => onDeleteComment(postId, reply.id)}
                                >
                                  [X]
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="comment-text">{reply.text}</p>
                        </div>
                      </div>
                    ))}

                    {isAdmin && replyingToId === comment.id && (
                      <form className="inline-reply-form" onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                        <label className="reply-form-label">
                          {t("blog.replyingTo")} {comment.authorName}:
                        </label>
                        <textarea
                          className="comment-textarea reply-textarea"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                          placeholder={t("blog.placeholderReply")}
                          maxLength={MAX_COMMENT_LENGTH}
                          required
                        />
                        <div className="reply-form-actions">
                          <button
                            type="button"
                            className="btn admin-action-btn"
                            onClick={() => setReplyingToId(null)}
                          >
                            {t("blog.cancelBtn")}
                          </button>
                          <button
                            type="submit"
                            className="btn admin-action-btn"
                            disabled={isSubmittingComment}
                          >
                            {t("blog.submitReplyBtn")} »
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <form className="comment-form" onSubmit={handleVisitorSubmit}>
            <p className="comment-form-title">{t("blog.addCommentTitle")}</p>
            {!isAdmin && (
              <input
                type="text"
                name="authorName"
                value={visitorForm.authorName}
                onChange={handleVisitorChange}
                placeholder={t("blog.placeholderAlias")}
                maxLength={60}
                required
              />
            )}
            <div className="textarea-wrapper">
              <textarea
                name="text"
                className="comment-textarea"
                value={visitorForm.text}
                onChange={handleVisitorChange}
                placeholder={t("blog.placeholderComment")}
                maxLength={MAX_COMMENT_LENGTH}
                required
              />
              <span className="char-counter">
                {visitorForm.text.length} / {MAX_COMMENT_LENGTH}
              </span>
            </div>

            <div className="honeypot-field" aria-hidden="true">
              <input
                type="text"
                name="website"
                value={visitorForm.website}
                onChange={handleVisitorChange}
                tabIndex="-1"
                autoComplete="off"
              />
            </div>

            <div className="comment-form-footer">
              <div className="form-status">
                {submitStatus === 'success' && (
                  <span className="status-msg success">{t("blog.commentStatusSuccess")}</span>
                )}
                {submitStatus === 'rate_limit' && (
                  <span className="status-msg error">{t("blog.commentStatusRateLimit")}</span>
                )}
                {submitStatus === 'error' && (
                  <span className="status-msg error">{t("blog.commentStatusError")}</span>
                )}
              </div>

              <button type="submit" className="btn submit-btn" disabled={isSubmittingComment}>
                {isSubmittingComment ? t("blog.submittingCommentBtn") : `${t("blog.submitCommentBtn")} »`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function BlogPostCard({ post, isAdmin, onDeletePost, onAddComment, onDeleteComment }) {
  const [t] = useTranslation("global");

  return (
    <article className="panel blog-card">
      <div className="blog-post-header">
        <div className="blog-post-title-row">
          <h3 className="blog-post-title">{post.title}</h3>
          {isAdmin && (
            <button
              type="button"
              className="btn admin-action-btn"
              onClick={() => onDeletePost(post.id)}
            >
              {t("blog.deletePostBtn")}
            </button>
          )}
        </div>
        <span className="blog-post-meta">
          {t("blog.publishedBy")} {post.createdAt}
        </span>
      </div>

      <p className="blog-post-content">{post.content}</p>

      {post.imageUrls && post.imageUrls.length > 0 && (
        <PostGallery images={post.imageUrls} postTitle={post.title} />
      )}

      <CommentSection
        postId={post.id}
        comments={post.comments}
        isAdmin={isAdmin}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />
    </article>
  );
}

function Blog() {
  const [t] = useTranslation("global");

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // "Last" button is automatically ON when on page 1 with no active search filter
  const isLastModeActive = currentPage === 1 && appliedQuery === '';

  // Admin states (Desktop only via Ctrl+Shift+L)
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [newPostForm, setNewPostForm] = useState({ title: '', content: '', files: [] });
  const [isPublishingPost, setIsPublishingPost] = useState(false);
  const fileInputRef = useRef(null);

  const isAdmin = Boolean(adminToken);

  const clearAdminSession = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken('');
  }, []);

  const fetchPosts = useCallback(async (pageToFetch, queryToFetch) => {
    try {
      const params = new URLSearchParams({
        page: String(pageToFetch),
        size: String(POSTS_PER_PAGE),
        search: queryToFetch
      });

      const response = await fetch(`${API_BASE_URL}/api/blog/posts?${params.toString()}`);
      if (!response.ok) return;

      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(Math.max(1, data.totalPages || 1));
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage, appliedQuery);
  }, [currentPage, appliedQuery, fetchPosts]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger on desktop screens (> 1000px)
      if (window.innerWidth > 1000 && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowAdminPrompt(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLastClick = () => {
    setSearchInput('');
    setAppliedQuery('');
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setAppliedQuery(searchInput.trim());
      setCurrentPage(1);
    }
  };

  const handleSelectPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminPassword.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });

      if (!response.ok) {
        setAdminPassword('');
        return;
      }

      const data = await response.json();
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setAdminToken(data.token);
      setAdminPassword('');
    } catch (error) {
      console.error("Admin login failed:", error);
    }
  };

  const handleAdminLogout = async () => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE_URL}/api/blog/admin/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      clearAdminSession();
      setShowAdminPrompt(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (isPublishingPost) return;

    const formData = new FormData();
    formData.append('title', newPostForm.title.trim());
    formData.append('content', newPostForm.content.trim());

    Array.from(newPostForm.files).forEach(file => {
      formData.append('images', file);
    });

    setIsPublishingPost(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData
      });

      if (response.status === 401) {
        clearAdminSession();
        return;
      }

      if (response.ok) {
        setNewPostForm({ title: '', content: '', files: [] });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        handleLastClick();
        await fetchPosts(1, '');
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsPublishingPost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.status === 401) {
        clearAdminSession();
        return;
      }

      if (response.ok) {
        const nextPage = posts.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        if (nextPage !== currentPage) {
          setCurrentPage(nextPage);
        } else {
          await fetchPosts(currentPage, appliedQuery);
        }
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleAddComment = async (postId, newCommentData) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${postId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newCommentData)
      });

      if (response.status === 401 && adminToken) {
        clearAdminSession();
        return 'error';
      }

      if (response.status === 429) {
        return 'rate_limit';
      }

      if (!response.ok) {
        return 'error';
      }

      // Honeypot returns 200 OK with empty body
      if (response.status === 200) {
        return 'success';
      }

      const createdComment = await response.json();
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, createdComment] }
            : post
        )
      );
      return 'success';
    } catch (error) {
      console.error("Failed to add comment:", error);
      return 'error';
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.status === 401) {
        clearAdminSession();
        return;
      }

      if (response.ok) {
        setPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.filter(c => c.id !== commentId && c.parentId !== commentId)
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className="window-pane">
      <div className="page-container">

        {/* Top Intro & Controls Panel */}
        <section className="panel blog-intro">
          <h2 className="section-title">
            <span className="blog-title-desktop">{t("blog.greetingDesktop")}</span>
            <span className="blog-title-mobile">{t("blog.greetingMobile")}</span>
          </h2>
          <p>{t("blog.introText")}</p>

          <div className="blog-controls-wrapper">
            <div className="blog-controls-main-row">
              <div className="blog-search-group">
                <button
                  type="button"
                  className={`btn blog-last-btn ${isLastModeActive ? 'active' : ''}`}
                  onClick={handleLastClick}
                >
                  {t("blog.lastBtn")}
                </button>
                <input
                  type="text"
                  className="blog-search-input"
                  placeholder={t("blog.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>

              <div className="pagination-mobile-row">
                <PaginationNumbers
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onSelectPage={handleSelectPage}
                />
              </div>
            </div>

            <div className="desktop-only-arrows">
              <PaginationArrows
                currentPage={currentPage}
                totalPages={totalPages}
                onSelectPage={handleSelectPage}
              />
            </div>
          </div>
        </section>

        {/* Secret Admin Panel (Login or Create Post Form) */}
        {showAdminPrompt && (
          <section className="panel admin-panel">
            {!isAdmin ? (
              <form className="admin-login-form" onSubmit={handleAdminLogin}>
                <h3 className="section-title">{t("blog.adminLoginTitle")}</h3>
                <div className="admin-login-row">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder={t("blog.adminPasswordPlaceholder")}
                    required
                  />
                  <button type="submit" className="btn">
                    {t("blog.adminLoginBtn")} »
                  </button>
                </div>
              </form>
            ) : (
              <form className="admin-form" onSubmit={handleCreatePost}>
                <div className="admin-header-row">
                  <h3 className="section-title">{t("blog.adminCreateTitle")}</h3>
                  <button
                    type="button"
                    className="btn admin-action-btn"
                    onClick={handleAdminLogout}
                  >
                    {t("blog.adminLogoutBtn")}
                  </button>
                </div>

                <div className="form-group">
                  <label>{t("blog.adminPostTitleLabel")}</label>
                  <input
                    type="text"
                    value={newPostForm.title}
                    onChange={(e) => setNewPostForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t("blog.adminPostTitlePlaceholder")}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("blog.adminPostContentLabel")}</label>
                  <textarea
                    className="admin-post-textarea"
                    value={newPostForm.content}
                    onChange={(e) => setNewPostForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={t("blog.adminPostContentPlaceholder")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("blog.adminPostImagesLabel")}</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setNewPostForm(prev => ({ ...prev, files: e.target.files }))}
                  />
                </div>

                <div className="comment-form-footer">
                  <button type="submit" className="btn" disabled={isPublishingPost}>
                    {t("blog.adminPublishBtn")} »
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Blog Posts List */}
        <section className="blog-posts-list">
          {posts.length === 0 ? (
            <div className="panel">
              <p className="no-results-msg">{t("blog.noPostsFound")}</p>
            </div>
          ) : (
            posts.map(post => (
              <BlogPostCard
                key={post.id}
                post={post}
                isAdmin={isAdmin}
                onDeletePost={handleDeletePost}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            ))
          )}
        </section>

        {/* Bottom Pagination */}
        <div className="blog-bottom-pagination">
          <div className="panel bottom-pagination-panel">
            <PaginationNumbers
              currentPage={currentPage}
              totalPages={totalPages}
              onSelectPage={handleSelectPage}
            />
            <PaginationArrows
              currentPage={currentPage}
              totalPages={totalPages}
              onSelectPage={handleSelectPage}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Blog;