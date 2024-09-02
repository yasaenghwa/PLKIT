import mock from './mock.json';
const { courses, questions } = mock;

function filterByKeyword(items, keyword) {
  const lowered = keyword.toLowerCase();
  return items.filter(({ title }) => title.toLowerCase().includes(lowered));
}

export function getCourses(keyword) {
  if (!keyword) return courses;
  return filterByKeyword(courses, keyword);
}

export function getCourseBySlug(courseSlug) {
  return courses.find((course) => course.slug === courseSlug);
}

export function getQuestions(keyword) {
  if (!keyword) return questions;
  return filterByKeyword(questions, keyword);
}

export function getQuestionById(questionId) {
  return questions.find((question) => question.id === questionId);
}

const WISHLIST_KEY = 'codethat-wishlist';
const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '{}');

export function addWishlist(courseSlug) {
  wishlist[courseSlug] = true;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

export function deleteWishlist(courseSlug) {
  delete wishlist[courseSlug];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

export function getWishlist() {
  return courses.filter((course) => wishlist[course.slug]);
}
