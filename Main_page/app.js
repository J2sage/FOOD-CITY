import { createReviewWithApi, getReviewsFromApi } from '../data/reviews-api.js';
import { openLoginModal, showAlertModal } from '../login.js';

const sideBar = document.getElementsByClassName('ham')[0];
const menuBtn = document.getElementsByClassName('sidebar-control')[0];
const menu = document.getElementById('menu');
const closeBtn = document.getElementById('close');

menuBtn.addEventListener('click', ()=>{
  if (menu.style.display !== 'none') {
    sideBar.style.display = 'block';
    menu.style.display = 'none';
    closeBtn.style.display = 'block';
    document.body.classList.add('no-scroll');
  } else{
    sideBar.style.display = 'none';
    menu.style.display = 'block';
    closeBtn.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }
});
sideBar.addEventListener('click', ()=>{
  if(sideBar.style.display === 'block'){
    sideBar.style.display = 'none';
    menu.style.display = 'block';
    closeBtn.style.display = 'none';
  }
})

// Scroll to reviews when the REVIEWS nav item is clicked
const reviewSection = document.querySelector('.review-container');
if (reviewSection) {
  const headerNavItems = document.querySelectorAll('nav.tab-links ul li a');
  const smallNavItems = document.querySelectorAll('.ham .small-nav li a');
  const allNavLinks = [...headerNavItems, ...smallNavItems];

  allNavLinks.forEach(link => {
    if (/reviews/i.test(link.textContent.trim())) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // close sidebar (mobile) if open
        if (sideBar.style.display === 'block') {
          sideBar.style.display = 'none';
          menu.style.display = 'block';
          closeBtn.style.display = 'none';
        }
      });
    }
  });
}






const extraComment = document.querySelector('.extra-comment');
const reviewRating = document.querySelector('.review-rating');
const additionalReviews = document.querySelector('.additional');
const postBtn = document.querySelector('.post_btn');
const commentOverlay = document.querySelector('.comment-overlay');

function escapeHtml(value = '') {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function starCount(rating) {
  // Ratings from 1.0–1.9 show one star, 2.0–2.9 show two, and so on.
  return Math.min(5, Math.max(1, Math.floor(Number(rating))));
}

function reviewAuthor(review) {
  return review.userName;
}

function renderReviews(data) {
  if (!additionalReviews) return;
  const reviews = Array.isArray(data) ? data : data.reviews || data.data || [];

  additionalReviews.innerHTML = reviews.map(review => {
    const author = reviewAuthor(review);
    const stars = '<span><img src="Main_page/assets/star-icon.svg" alt="star"></span>'.repeat(starCount(review.rating));
    return `
      <div class="comment-section">
        <div class="profile-comm">
          <div class="profile-name">${escapeHtml(author.trim().charAt(0).toUpperCase())}</div>
          <p>${escapeHtml(author)}</p>
        </div>
        <div class="textarea">
          <div class="rating" aria-label="${starCount(review.rating)} out of 5 stars">${stars}</div>
          <div class="comment"><p>${escapeHtml(review.comment || review.content || '')}</p></div>
        </div>
      </div>`;
  }).join('');
}

async function loadReviews() {
  try {
    renderReviews(await getReviewsFromApi());
  } catch (error) {
    console.error('Could not load reviews:', error);
  }
}

if (postBtn) {
  postBtn.addEventListener('click', async () => {
    const comment = extraComment.value.trim();
    const rating = Number(reviewRating.value);

    if (!comment || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      showAlertModal('Error', 'Enter your comment, and a rating from 1.0 to 5.0.', 'person-add-outline') 
      return;
    }

    try {
      postBtn.disabled = true;
      await createReviewWithApi({ comment, rating });
      extraComment.value = '';
      reviewRating.value = '';
      await loadReviews();
      commentOverlay.style.display = 'flex';
      setTimeout(() => { commentOverlay.style.display = 'none'; }, 3000);
    } catch (error) {
      showAlertModal('Error', 'Could not post your review, Please Log in.', 'person-add-outline');
      document.querySelector('.alert-btn')?.addEventListener('click', (e)=>{
        e.preventDefault();
        openLoginModal();
      });
    } finally {
      postBtn.disabled = false;
    }
  });
}

loadReviews();
