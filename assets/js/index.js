"use strict";

/////////////////////////////////////////////////
// DOM Elements

const tabsContainer = document.querySelector(".operations__tab-container");
const dotsContainer = document.querySelector(".dots");

const allSections = document.querySelectorAll(".section");
const section1 = document.querySelector("#section--1");

const header = document.querySelector(".header");

const btnOpenModal = document.querySelector(".btn--show-modal");
const btnCloseModal = document.querySelector(".btn--close-modal");
const btnScrollTo = document.querySelector(".btn--scroll-to");
const btnLeft = document.querySelector(".slider__btn--left");
const btnRight = document.querySelector(".slider__btn--right");

const nav = document.querySelector(".nav");
const navLinks = document.querySelector(".nav__links");
const navHeight = nav.getBoundingClientRect().height;

const imgTargets = document.querySelectorAll(".lazy-img");

const tabs = document.querySelectorAll(".operations__tab");
const tabsContent = document.querySelectorAll(".operations__content");

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const slides = document.querySelectorAll(".slide");

/////////////////////////////////////////////////
// Constants

const maxSlide = slides.length;

/////////////////////////////////////////////////
// State Variables

let currentSlide = 0;

/////////////////////////////////////////////////
// Functions

// Intersection observers: Sticky Navigation
const stickyNavigation = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) nav.classList.add("sticky");
  else nav.classList.remove("sticky");
};

// Intersection observers: Reveal sections on scroll
const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove("section--hidden");
  observer.unobserve(entry.target);
};

// Intersection observers: Lazy load images
const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener("load", function () {
    entry.target.classList.remove("lazy-img");
  });
  observer.unobserve(entry.target);
};

// Intersection observers
const headerObserver = new IntersectionObserver(stickyNavigation, {
  root: null,
  rootMargin: `-${navHeight}px`,
  threshold: 0,
});
headerObserver.observe(header);

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});
allSections.forEach(function (section) {
  sectionObserver.observe(section);
});

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  rootMargin: "200px",
  threshold: 0,
});
imgTargets.forEach(function (imgTarget) {
  imgObserver.observe(imgTarget);
});

// Slider: Create navigation dots
const createDots = function () {
  slides.forEach(function (_, index) {
    dotsContainer.insertAdjacentHTML(
      "beforeend",
      `<button class="dots__dot" data-slide="${index}"></button>`
    );
  });
};

// Slider: Activate the current dot
const activateDot = function (currentSlide) {
  document.querySelectorAll(".dots__dot").forEach(function (dot) {
    dot.classList.remove("dots__dot--active");
  });

  document
    .querySelector(`.dots__dot[data-slide="${currentSlide}"]`)
    .classList.add("dots__dot--active");
};

// Slider: Move to the specified slide
const goToSlide = function (currentSlide) {
  slides.forEach(function (slide, index) {
    slide.style.transform = `translateX(${100 * (index - currentSlide)}%)`;
  });
};

// Slider: Initialize slider
(function () {
  goToSlide(0);
  createDots();
  activateDot(0);
})();

/////////////////////////////////////////////////
// Event Handlers

// Navigation: Handle navigation link hover effect
const handleNavLinkHoverEffect = function (event) {
  if (event.target.classList.contains("nav__link")) {
    const link = event.target;
    const siblings = link.closest(".nav").querySelectorAll(".nav__link");
    const logo = link.closest(".nav").querySelector("img");

    siblings.forEach((element) => {
      if (element !== link) element.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

// Navigation: Handle navigation link click
const handleNavLinksClick = function (event) {
  event.preventDefault();

  if (event.target.classList.contains("nav__link--btn")) {
    window.location.href = "pages/bank.html";

    return;
  }

  if (event.target.classList.contains("nav__link")) {
    const id = event.target.getAttribute("href");

    document.querySelector(id).scrollIntoView({ behavior: "smooth" });
  }
};

// Navigation: Handle scroll to section 1
const handleBtnScrollToClick = function (event) {
  section1.scrollIntoView({ behavior: "smooth" });
};

// Tabs: Handle tab click
const handleTabClick = function (event) {
  const clicked = event.target.closest(".operations__tab");

  // Guard clause
  if (!clicked) return;

  // Remove active classes
  tabs.forEach((tab) => tab.classList.remove("operations__tab--active"));
  tabsContent.forEach((tabContent) =>
    tabContent.classList.remove("operations__content--active")
  );

  // Activate tab
  clicked.classList.toggle("operations__tab--active");

  // Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add("operations__content--active");
};

// Slider: Move to the next slide
const goToNextSlide = function () {
  if (currentSlide === maxSlide - 1) currentSlide = 0;
  else currentSlide++;

  goToSlide(currentSlide);
  activateDot(currentSlide);
};

// Slider: Move to the previous slide
const goToPreviousSlide = function () {
  if (currentSlide === 0) currentSlide = maxSlide - 1;
  else currentSlide--;

  goToSlide(currentSlide);
  activateDot(currentSlide);
};

// Slider: Handle dot click navigation
const handleDotClick = function (event) {
  if (event.target.classList.contains("dots__dot")) {
    currentSlide = event.target.dataset.slide;

    goToSlide(currentSlide);
    activateDot(currentSlide);
  }
};

// Slider: Handle arrow key navigation
const handleArrowKeyNavigation = function (event) {
  const key = event.key;

  if (key === "ArrowRight") goToNextSlide(currentSlide);
  else if (key === "ArrowLeft") goToPreviousSlide(currentSlide);
};

// Popup model: Open Modal
const openPopupModal = function (event) {
  event.preventDefault();

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// Popup model: Close Modal
const closePopupModal = function (event) {
  event.preventDefault();

  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

// Popup model: Handle Escape Key to Hide Modal
const handleEscKey = function (event) {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closePopupModal(event);
  }
};

///////////////////////////////////////
// Event Listeners

// Navigation
nav.addEventListener("mouseover", handleNavLinkHoverEffect.bind(0.5));
nav.addEventListener("mouseout", handleNavLinkHoverEffect.bind(1));
navLinks.addEventListener("click", handleNavLinksClick);
btnScrollTo.addEventListener("click", handleBtnScrollToClick);

// Tabs
tabsContainer.addEventListener("click", handleTabClick);

// Slider
btnRight.addEventListener("click", goToNextSlide);
btnLeft.addEventListener("click", goToPreviousSlide);
dotsContainer.addEventListener("click", handleDotClick);
document.addEventListener("keydown", handleArrowKeyNavigation);

// Popup model
btnOpenModal.addEventListener("click", openPopupModal);
btnCloseModal.addEventListener("click", closePopupModal);
overlay.addEventListener("click", closePopupModal);
document.addEventListener("keydown", handleEscKey);
