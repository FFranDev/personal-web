import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Blog.css';

import cgruleengineMain from '../../assets/projects/cgruleengine/cgruleengine_main.jpg';
import cgruleengineGallery1 from '../../assets/projects/cgruleengine/cgruleengine_1.png';
import personalwebMain from '../../assets/projects/personalweb/personalweb_main.png';

const POSTS_PER_PAGE = 5;
const MAX_COMMENT_LENGTH = 600;

// Initial mock data to test pagination, gallery, and nested comments before backend integration
const INITIAL_MOCK_POSTS = [
  {
    id: 1,
    title: "Arquitectura de pila de efectos en CGRuleEngine",
    createdAt: "17/10/2026",
    content: "Uno de los mayores retos al desarrollar un motor de reglas para juegos de cartas es resolver correctamente las cadenas de efectos cuando una carta responde a otra.\n\nEn esta entrada repaso cómo implementé una estructura LIFO (Last In, First Out) desacoplada de Godot para que cualquier efecto pueda pausar la partida, pedir objetivos y resolverse en orden inverso.",
    imageUrls: [cgruleengineMain, cgruleengineGallery1],
    comments: [
      {
        id: 101,
        authorName: "Carlos M.",
        isAuthor: false,
        createdAt: "17/10/2026",
        text: "¡Muy buen enfoque! ¿La pila permite cancelar efectos intermedios antes de que se resuelvan?",
        parentId: null
      },
      {
        id: 102,
        authorName: "Fran",
        isAuthor: true,
        createdAt: "17/10/2026",
        text: "¡Gracias Carlos! Sí, cualquier nodo de la pila puede anular o modificar un efecto inferior antes de su ejecución.",
        parentId: 101
      }
    ]
  },
  {
    id: 2,
    title: "Estreno del nuevo portfolio con React y Spring Boot",
    createdAt: "14/10/2026",
    content: "Hoy queda inaugurada la versión renovada de mi web personal. El objetivo principal era construir una interfaz rápida y con personalidad propia inspirada en sistemas clásicos, respaldada por un backend en Java 25 con Spring Boot y PostgreSQL contenerizado en Docker.",
    imageUrls: [personalwebMain],
    comments: []
  },
  {
    id: 3,
    title: "Utilidades para prototipado rápido en Godot con C#",
    createdAt: "10/10/2026",
    content: "Durante las últimas semanas he estado recopilando patrones que repito constantemente al iniciar proyectos en Godot: máquinas de estados finitos, gestores de audio centralizados y sistemas de eventos tipados en C#.",
    imageUrls: [],
    comments: []
  },
  {
    id: 4,
    title: "Contenerización de entornos de desarrollo Full-Stack",
    createdAt: "05/10/2026",
    content: "Configurar Docker Compose con healthchecks entre PostgreSQL y Spring Boot evita los clásicos fallos de conexión en el arranque cuando el contenedor de la aplicación levanta más rápido que el motor de base de datos.",
    imageUrls: [],
    comments: []
  },
  {
    id: 5,
    title: "Diseño de interfaces retro solo con CSS nativo",
    createdAt: "28/09/2026",
    content: "Prescindir de librerías pesadas de componentes permite controlar al píxel los bordes dobles, sombras sólidas desplazadas y animaciones discretas por pasos mediante steps() en CSS.",
    imageUrls: [],
    comments: []
  },
  {
    id: 6,
    title: "Primeras notas sobre el desarrollo de CGRuleEngine",
    createdAt: "15/09/2026",
    content: "Definición de los requisitos iniciales del Trabajo de Fin de Grado: separar al 100% la lógica del juego de la interfaz gráfica mediante una librería en .NET Standard 2.1.",
    imageUrls: [],
    comments: []
  }
];

// Builds compact pagination array (e.g. [1, 2, '...', 5])
function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sortedPages.length; i++) {
    if (i > 0 && sortedPages[i] - sortedPages[i - 1] > 1) {
      result.push('...');
    }
    result.push(sortedPages[i]);
  }

  return result;
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

  return (
    <div className="blog-gallery-wrapper">
      <div
        className="gallery-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
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

  // Group top-level comments and their 1-level replies
  const rootComments = useMemo(() => comments.filter(c => !c.parentId), [comments]);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  const handleVisitorChange = (e) => {
    const { name, value, maxLength } = e.target;
    const finalValue = maxLength > 0 ? value.slice(0, maxLength) : value;
    setVisitorForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleVisitorSubmit = (e) => {
    e.preventDefault();
    if (visitorForm.website) return; // Honeypot check

    onAddComment(postId, {
      authorName: isAdmin ? "Fran" : visitorForm.authorName.trim(),
      isAuthor: isAdmin,
      text: visitorForm.text.trim(),
      parentId: null
    });
    setVisitorForm({ authorName: '', text: '', website: '' });
  };

  const handleReplySubmit = (e, parentCommentId) => {
    e.preventDefault();
    onAddComment(postId, {
      authorName: "Fran",
      isAuthor: true,
      text: replyText.trim(),
      parentId: parentCommentId
    });
    setReplyText('');
    setReplyingToId(null);
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
                          <button type="submit" className="btn admin-action-btn">
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
              <button type="submit" className="btn">
                {t("blog.submitCommentBtn")} »
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

  const [posts, setPosts] = useState(INITIAL_MOCK_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastModeActive, setIsLastModeActive] = useState(true);

  // Secret Admin states (Triggered by Ctrl+Shift+L or 3 clicks on the blog title)
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newPostForm, setNewPostForm] = useState({ title: '', content: '', files: [] });
  const titleClickCount = useRef(0);
  const titleClickTimer = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowAdminPrompt(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTitleSecretClick = () => {
    titleClickCount.current += 1;
    clearTimeout(titleClickTimer.current);

    if (titleClickCount.current >= 3) {
      titleClickCount.current = 0;
      setShowAdminPrompt(prev => !prev);
    } else {
      titleClickTimer.current = setTimeout(() => {
        titleClickCount.current = 0;
      }, 500);
    }
  };

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handleLastClick = () => {
    setIsLastModeActive(true);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setIsLastModeActive(false);
  };

  const handleSelectPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    setIsLastModeActive(false);
  };

  // Mock handlers ready to be replaced by Backend API calls in Step 3 & 4
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword.trim()) {
      setIsAdmin(true);
      setAdminPassword('');
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    const previewUrls = Array.from(newPostForm.files).map(file => URL.createObjectURL(file));
    const today = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const createdPost = {
      id: Date.now(),
      title: newPostForm.title.trim(),
      content: newPostForm.content.trim(),
      createdAt: today,
      imageUrls: previewUrls,
      comments: []
    };

    setPosts(prev => [createdPost, ...prev]);
    setNewPostForm({ title: '', content: '', files: [] });
    handleLastClick();
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleAddComment = (postId, newCommentData) => {
    const today = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const createdComment = {
      id: Date.now(),
      createdAt: today,
      ...newCommentData
    };

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, createdComment] }
          : post
      )
    );
  };

  const handleDeleteComment = (postId, commentId) => {
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
  };

  return (
    <div className="window-pane">
      <div className="page-container">

        {/* Top Intro & Controls Panel */}
        <section className="panel blog-intro">
          <h2 className="section-title" onClick={handleTitleSecretClick}>
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
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="pagination-mobile-row">
                <PaginationNumbers
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onSelectPage={handleSelectPage}
                />
                <div className="mobile-only-arrows">
                  <PaginationArrows
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onSelectPage={handleSelectPage}
                  />
                </div>
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
                    onClick={() => {
                      setIsAdmin(false);
                      setShowAdminPrompt(false);
                    }}
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
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setNewPostForm(prev => ({ ...prev, files: e.target.files }))}
                  />
                </div>

                <div className="comment-form-footer">
                  <button type="submit" className="btn">
                    {t("blog.adminPublishBtn")} »
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Blog Posts List */}
        <section className="blog-posts-list">
          {paginatedPosts.length === 0 ? (
            <div className="panel">
              <p className="no-results-msg">{t("blog.noPostsFound")}</p>
            </div>
          ) : (
            paginatedPosts.map(post => (
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