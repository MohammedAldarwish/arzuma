// Centralized API utility for authenticated requests with automatic token refresh

/**
 * Usage:
 *   import { authFetch } from './api';
 *   const response = await authFetch(url, options);
 */

// Dynamic API base URL - works for both localhost and network access
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://127.0.0.1:8000' 
  : 'http://192.168.178.107:8000';

function getAccessToken() {
  return localStorage.getItem('token');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('token', access);
  if (refresh) localStorage.setItem('refreshToken', refresh);
}

function clearTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  
  try {
    const response = await fetch(`${API_BASE}/api/accounts/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!response.ok) {
      // Log the error response for debugging
      const errorText = await response.text();
      console.error('Token refresh failed:', response.status, response.statusText, errorText);
      
      if (response.status === 403) {
        throw new Error('CSRF protection error - backend needs configuration');
      }
      throw new Error('Refresh token invalid');
    }
    
    const data = await response.json();
    setTokens({ access: data.access, refresh: data.refresh || refreshToken });
    return data.access;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

/**
 * authFetch: Like fetch, but automatically refreshes access token and retries once if 401.
 * Throws if refresh fails.
 */
export async function authFetch(url, options = {}, retry = true) {
  let accessToken = getAccessToken();
  const authHeaders = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};



  // Merge headers
  const headers = {
    ...(options.headers || {}),
    ...authHeaders,
  };

  // Don't set Content-Type if body is FormData
  if (
    options.body &&
    typeof window !== 'undefined' &&
    window.FormData &&
    options.body instanceof window.FormData
  ) {
    // Let browser set Content-Type
    delete headers['Content-Type'];
  }

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401 && retry) {
    console.log('Got 401, token refresh not available - clearing tokens');
    // Token refresh endpoint not available, just clear tokens
    clearTokens();
    throw new Error('Session expired');
  }

  return response;
}

export { getAccessToken, getRefreshToken, setTokens, clearTokens };

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user has valid tokens
 */
export function isAuthenticated() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  return !!(accessToken && refreshToken);
}

/**
 * Search users by username with live search support
 * @param {string} searchQuery - The search query
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Array of user objects
 */
export async function searchUsers(searchQuery, limit = 10) {
  try {
    const response = await authFetch(
      `${API_BASE}/api/accounts/users/search/?search=${encodeURIComponent(searchQuery)}`
    );
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const data = await response.json();
    // Django REST Framework returns results in 'results' field for pagination
    // or directly as array if no pagination
    const users = data.results || data;
    
    // Limit results on frontend if backend doesn't support limit parameter
    return users.slice(0, limit);
  } catch (error) {
    console.error('User search error:', error);
    throw error;
  }
}

/**
 * Get user profile by username
 * @param {string} username - The username to fetch profile for
 * @returns {Promise<Object>} User profile object
 */
export async function getUserProfile(username) {
  try {
    const response = await fetch(`${API_BASE}/api/accounts/profile/${username}/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
}

/**
 * Get current user's profile (authenticated)
 * @returns {Promise<Object>} Current user profile object
 */
export async function getMyProfile() {
  try {
    const response = await authFetch(`${API_BASE}/api/accounts/my-profile/`);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired');
      }
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get my profile error:', error);
    throw error;
  }
}

/**
 * Follow a user by ID
 * @param {number|string} followedUserId - The user ID to follow
 * @returns {Promise<Object>} API response
 */
export async function followUser(followedUserId) {
  const response = await authFetch(`${API_BASE}/api/accounts/follow/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followed_user: followedUserId }),
  });
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    const text = await response.text();
    throw new Error('Response is not JSON: ' + text);
  }
}

/**
 * Unfollow a user by ID
 * @param {number|string} followedUserId - The user ID to unfollow
 * @returns {Promise<Object>} API response
 */
export async function unfollowUser(followedUserId) {
  const response = await authFetch(`${API_BASE}/api/accounts/follow/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followed_user: followedUserId }),
  });
  return response.json();
}

// ===== ART POSTS API =====

/**
 * Get all art posts with pagination
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Paginated art posts
 */
export async function getArtPosts(page = 1) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/art/?page=${page}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch art posts: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get art posts error:', error);
    throw error;
  }
}

/**
 * Get a single art post by ID
 * @param {number} postId - The post ID
 * @returns {Promise<Object>} Art post object
 */
export async function getArtPost(postId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/art/${postId}/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(`Failed to fetch post: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get art post error:', error);
    throw error;
  }
}

/**
 * Create a new art post
 * @param {FormData} postData - FormData containing post information and image
 * @returns {Promise<Object>} Created post object
 */
export async function createArtPost(postData) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/art/`, {
      method: 'POST',
      body: postData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to create post: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create art post error:', error);
    throw error;
  }
}

/**
 * Update an art post
 * @param {number} postId - The post ID
 * @param {FormData} postData - FormData containing updated post information
 * @returns {Promise<Object>} Updated post object
 */
export async function updateArtPost(postId, postData) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/art/${postId}/`, {
      method: 'PUT',
      body: postData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to update post: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update art post error:', error);
    throw error;
  }
}

/**
 * Delete an art post
 * @param {number} postId - The post ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteArtPost(postId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/art/${postId}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Delete art post error:', error);
    throw error;
  }
}

// ===== COMMENTS API =====

/**
 * Get comments for a post
 * @param {number} postId - The post ID
 * @returns {Promise<Array>} Array of comment objects
 */
export async function getComments(postId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/comments/?post=${postId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Get comments error:', error);
    throw error;
  }
}

/**
 * Create a comment on a post
 * @param {number} postId - The post ID
 * @param {string} content - The comment content
 * @returns {Promise<Object>} Created comment object
 */
export async function createComment(postId, content) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post: postId,
        content: content,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to create comment: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create comment error:', error);
    throw error;
  }
}

/**
 * Delete a comment
 * @param {number} commentId - The comment ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteComment(commentId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/comments/${commentId}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Delete comment error:', error);
    throw error;
  }
}

// ===== LIKES API =====

/**
 * Get likes for a post
 * @param {number} postId - The post ID
 * @returns {Promise<Array>} Array of like objects
 */
export async function getLikes(postId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/likes/?post=${postId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch likes: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Get likes error:', error);
    throw error;
  }
}

/**
 * Like a post
 * @param {number} postId - The post ID
 * @returns {Promise<Object>} Created like object
 */
export async function likePost(postId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/likes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post: postId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to like post: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Like post error:', error);
    throw error;
  }
}

/**
 * Unlike a post
 * @param {number} likeId - The like ID
 * @returns {Promise<boolean>} Success status
 */
export async function unlikePost(likeId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/likes/${likeId}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to unlike post: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Unlike post error:', error);
    throw error;
  }
}

/**
 * Check if a user has liked a post
 * @param {number} postId - The post ID
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} True if user has liked the post
 */
export async function hasUserLikedPost(postId, userId) {
  try {
    const response = await authFetch(`${API_BASE}/api/posts/likes/?post=${postId}&user=${userId}`);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.length > 0;
  } catch (error) {
    console.error('Check user like error:', error);
    return false;
  }
}

/**
 * Get art posts for a specific user
 * @param {string} username - The username to fetch posts for
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Object containing posts and pagination info
 */
export async function getUserPosts(username, page = 1) {
  try {
    const url = `${API_BASE}/api/posts/art/?user=${encodeURIComponent(username)}&page=${page}`;
    console.log('Fetching user posts from:', url);
    
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user posts: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    // Ensure we always return an array for posts
    const posts = Array.isArray(data.results) ? data.results : 
                  Array.isArray(data) ? data : [];
    
    console.log('Processed posts:', posts);
    
    return {
      posts: posts,
      hasNext: !!data.next,
      hasPrevious: !!data.previous,
      totalPages: Math.ceil((data.count || posts.length) / 12), // Using 12 posts per page as configured
      currentPage: page
    };
  } catch (error) {
    console.error('Get user posts error:', error);
    throw error;
  }
}

/**
 * ===== STORIES API =====
 */

/**
 * Get all active stories (last 24h)
 * @returns {Promise<Array>} Array of stories
 */
export async function getStories() {
  try {
    const response = await authFetch(`${API_BASE}/api/stories/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.status}`);
    }
    const data = await response.json();
    console.log("Stories from API:", data);
    return data;
  } catch (error) {
    console.error('Get stories error:', error);
    throw error;
  }
}

/**
 * Create a new story (image/video)
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} Created story
 */
export async function createStory(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await authFetch(`${API_BASE}/api/stories/create/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to create story: ${response.status}`);
    }
    const data = await response.json();
    console.log("Stories from API:", data);
    return data;
  } catch (error) {
    console.error('Create story error:', error);
    throw error;
  }
}

/**
 * Delete a story by ID
 * @param {number|string} storyId - The story ID
 * @returns {Promise<void>}
 */
export async function deleteStory(storyId) {
  try {
    const response = await authFetch(`${API_BASE}/api/stories/${storyId}/delete/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete story: ${response.status}`);
    }
  } catch (error) {
    console.error('Delete story error:', error);
    throw error;
  }
}

// ===== COURSE API FUNCTIONS =====

/**
 * Get all approved courses
 * @returns {Promise<Array>} Array of courses
 */
export async function getCourses() {
  try {
    const response = await fetch(`${API_BASE}/api/course/courses/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Get courses error:', error);
    throw error;
  }
}

/**
 * Get a specific course by ID
 * @param {number|string} courseId - The course ID
 * @returns {Promise<Object>} Course object
 */
export async function getCourse(courseId) {
  try {
    const response = await fetch(`${API_BASE}/api/course/courses/${courseId}/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get course error:', error);
    throw error;
  }
}

/**
 * Create a new course (instructors only)
 * @param {FormData} courseData - Course data including:
 *   - title: Course title
 *   - description: Course description  
 *   - price: Course price (for paid courses)
 *   - is_free: Boolean indicating if course is free
 *   - course_image: Course image file
 *   - stripe_session_id: Stripe session ID (required for paid courses)
 * @returns {Promise<Object>} Created course
 */
export async function createCourse(courseData) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/courses/`, {
      method: 'POST',
      body: courseData, // FormData will be sent directly
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create course: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create course error:', error);
    throw error;
  }
}

/**
 * Update a course (instructors only)
 * @param {number|string} courseId - The course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(courseId, courseData) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/courses/${courseId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update course: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update course error:', error);
    throw error;
  }
}

/**
 * Delete a course (instructors only)
 * @param {number|string} courseId - The course ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCourse(courseId) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/courses/${courseId}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete course: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Delete course error:', error);
    throw error;
  }
}

/**
 * Get lessons for a specific course
 * @param {number|string} courseId - The course ID
 * @returns {Promise<Array>} Array of lessons
 */
export async function getCourseLessons(courseId) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/lesson/?course=${courseId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lessons: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Get course lessons error:', error);
    throw error;
  }
}

/**
 * Create a new lesson (instructors only)
 * @param {Object} lessonData - Lesson data
 * @returns {Promise<Object>} Created lesson
 */
export async function createLesson(lessonData) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/lesson/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create lesson: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create lesson error:', error);
    throw error;
  }
}

/**
 * Get ratings for a specific course
 * @param {number|string} courseId - The course ID
 * @returns {Promise<Array>} Array of ratings
 */
export async function getCourseRatings(courseId) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/rating/?course=${courseId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ratings: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Get course ratings error:', error);
    throw error;
  }
}

/**
 * Create or update a course rating (enrolled users only)
 * @param {Object} ratingData - Rating data
 * @returns {Promise<Object>} Created/updated rating
 */
export async function createCourseRating(ratingData) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/rating/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create rating: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create course rating error:', error);
    throw error;
  }
}

/**
 * Create Stripe checkout session for course enrollment
 * @param {number|string} courseId - The course ID
 * @returns {Promise<Object>} Checkout session with URL
 */
export async function createCheckoutSession(courseId) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/create-checkout-session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ course_id: courseId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `Failed to create checkout session: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create checkout session error:', error);
    throw error;
  }
}

/**
 * Check if user is enrolled in a course
 * @param {number|string} courseId - The course ID
 * @returns {Promise<boolean>} Enrollment status
 */
export async function checkEnrollment(courseId) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/enrollment/?course=${courseId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to check enrollment: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results && data.results.length > 0;
  } catch (error) {
    console.error('Check enrollment error:', error);
    return false;
  }
}

/**
 * Get enrollment details for a course
 * @param {number|string} courseId - The course ID
 * @returns {Promise<Object>} Enrollment details
 */
export async function getEnrollmentDetails(courseId) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/enrollment/?course=${courseId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get enrollment details: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.error('Get enrollment details error:', error);
    return null;
  }
}

/**
 * Enroll in a free course
 * @param {number|string} courseId - The course ID
 * @returns {Promise<Object>} Enrollment details
 */
export async function enrollInFreeCourse(courseId) {
  try {
    const response = await authFetch(`${API_BASE}/api/course/enrollment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ course: courseId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `Failed to enroll in free course: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Enroll in free course error:', error);
    throw error;
  }
}

/**
 * Create Stripe account link for instructor setup
 * @returns {Promise<Object>} Account link with URL
 */
export async function createStripeAccountLink() {
  try {
    const response = await authFetch(`${API_BASE}/api/course/create-account-link/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `Failed to create account link: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create account link error:', error);
    throw error;
  }
}

/**
 * Request instructor access (for non-instructors)
 * @returns {Promise<Object>} API response
 */
export async function requestInstructorAccess() {
  try {
    const response = await authFetch(`${API_BASE}/api/course/request-instructor/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to request instructor access: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request instructor access error:', error);
    throw error;
  }
}

/**
 * Create Stripe Connect onboarding for user
 * @returns {Promise<Object>} Onboarding response with account link URL
 */
export async function createStripeOnboarding() {
  try {
    const response = await authFetch(`${API_BASE}/api/course/stripe/onboarding/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create Stripe onboarding: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create Stripe onboarding error:', error);
    throw error;
  }
}

/**
 * Get Stripe account status for current user
 * @returns {Promise<Object>} Account status information
 */
export async function getStripeAccountStatus() {
  try {
    const response = await authFetch(`${API_BASE}/api/course/stripe/account-status/`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to get account status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get Stripe account status error:', error);
    throw error;
  }
}

/**
 * Create Stripe dashboard link for user
 * @returns {Promise<Object>} Dashboard link response
 */
export async function createStripeDashboardLink() {
  try {
    const response = await authFetch(`${API_BASE}/api/course/stripe/dashboard/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create dashboard link: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create Stripe dashboard link error:', error);
    throw error;
  }
}