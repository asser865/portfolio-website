'use strict';

// Preloader functionality
const preloader = document.querySelector("[data-preloader]");

setTimeout(function () {
  if (preloader) {
    preloader.classList.add("loaded");
    document.body.classList.add("loaded");
  }
}, 4000); // 5000 milliseconds = 5 seconds


// Element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// Sidebar toggle functionality for mobile
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}

// Page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const projectTriggers = document.querySelectorAll("[data-switch-page]");
const pages = document.querySelectorAll("[data-page]");

// Function to handle switching between any page
const switchPage = (targetPageId) => {
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].dataset.page === targetPageId) {
      pages[i].classList.add("active");
    } else {
      pages[i].classList.remove("active");
    }
  }
  window.scrollTo(0, 0);
};

// Add event listeners to main navigation links
navigationLinks.forEach(link => {
  link.addEventListener("click", function () {
    const targetPage = this.innerHTML.toLowerCase();
    switchPage(targetPage);

    // Update active state for nav links
    navigationLinks.forEach(navLink => navLink.classList.remove("active"));
    this.classList.add("active");
  });
});

// Add event listeners to project triggers
projectTriggers.forEach(trigger => {
  trigger.addEventListener("click", function () {
    const targetPage = this.dataset.switchPage;
    switchPage(targetPage);

    // Deactivate all main nav links when viewing a project detail page
    navigationLinks.forEach(navLink => navLink.classList.remove("active"));
  });
});

// Back Button Functionality
const backButtons = document.querySelectorAll("[data-back-btn]");

backButtons.forEach(button => {
  button.addEventListener("click", function(event) {
    event.preventDefault();
    
    // Programmatically click the 'About' navigation link to go back
    const aboutLink = document.querySelector('[data-nav-link]'); // Assumes 'About' is the first link
    if (aboutLink) {
      aboutLink.click();
    }
  });
});