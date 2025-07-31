"use client";
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const CommentSection = ({ articleId, articleSlug, articleType, articleTitle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Load approved comments on component mount
  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await fetch(`/api/comments?articleId=${articleId}&status=approved`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) {
      setStatus('error');
      setMessage('Please fill in all fields.');
      return;
    }

    if (formData.comment.length < 10) {
      setStatus('error');
      setMessage('Comment must be at least 10 characters long.');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          articleId,
          articleSlug,
          articleType,
          articleTitle
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you! Your comment has been submitted and is pending review.');
        setFormData({ name: '', email: '', comment: '' });
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to submit comment. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const StatusMessage = () => {
    if (status === 'success') {
      return (
        <div className="flex items-center p-4 mb-4 text-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{message}</span>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="flex items-center p-4 mb-4 text-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{message}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="mt-12 mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      {/* Comments Header */}
      <div className="flex items-center mb-6">
        <MessageCircle className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Existing Comments */}
      <div className="mb-8">
        {commentsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {comment.name}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comment.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>

      {/* Comment Form */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Leave a Comment
        </h4>
        
        <StatusMessage />

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 mr-1" />
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Your name"
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="your.email@example.com"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label htmlFor="comment" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment *
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-vertical"
              placeholder="Share your thoughts about this article..."
              disabled={status === 'loading'}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.comment.length}/1000 characters (minimum 10)
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {status === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Comment
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your email will not be published. All comments are moderated before appearing on the site.
          </p>
        </form>
      </div>
    </section>
  );
};

export default CommentSection;