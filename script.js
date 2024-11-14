// Add event listener to nav links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        const sectionId = link.getAttribute('href').replace('#', '');
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    });
});

// Initialize AOS library
AOS.init({
    duration: 1000,
    delay: 500,
});

// Initialize GSAP library
gsap.registerPlugin(ScrollTrigger);

gsap.from('.hero-content', {
    duration: 1,
    opacity: 0,
    y: 100,
    scrollTrigger: {
        trigger: '.hero',
        start: 'top 80%',
        end: 'bottom 20%',
    },
});

gsap.from('.project-list li', {
    duration: 1,
    opacity: 0,
    y: 100,
    scrollTrigger: {
        trigger: '.projects',
        start: 'top 80%',
        end: 'bottom 20%',
    },
});

gsap.from('.skill-list li', {
    duration: 1,
    opacity: 0,
    y: 100,
    scrollTrigger: {
        trigger: '.skills',
        start: 'top 80%',
        end: 'bottom 20%',
    },
});

gsap.from('.blog-list li', {
    duration: 1,
    opacity: 0,
    y: 100,
    scrollTrigger: {
        trigger: '.blog',
        start: 'top 80%',
        end: 'bottom 20%',
    },
});

// Add event listener to project cards
document.querySelectorAll('.project-list li').forEach(card => {
    card.addEventListener('click', () => {
        const projectId = card.dataset.projectId;
        const projectDetails = document.getElementById(`project-details-${projectId}`);
        projectDetails.classList.toggle('show');
    });
});

// Add event listener to skill items
document.querySelectorAll('.skill-list li').forEach(skill => {
    skill.addEventListener('click', () => {
        const skillId = skill.dataset.skillId;
        const skillDetails = document.getElementById(`skill-details-${skillId}`);
        skillDetails.classList.toggle('show');
    });
});

// Add event listener to blog posts
document.querySelectorAll('.blog-list li').forEach(post => {
    post.addEventListener('click', () => {
        const postId = post.dataset.postId;
        const postDetails = document.getElementById(`post-details-${postId}`);
        postDetails.classList.toggle('show');
    });
});

// skills//
document.querySelectorAll('.progress-bar').forEach(bar => {
    const progress = bar.getAttribute('data-progress');
    bar.style.width = progress + '%';
    bar.style.backgroundColor = 'green'; // Set color to green
});


// Initialize EmailJS with your User ID
(function() {
    emailjs.init("stark");  // Replace with your EmailJS User ID
})();

// Add event listener for the contact form submission
document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();  // Prevent the form from submitting traditionally

    // Show a status message while the email is being sent
    const formStatus = document.getElementById("formStatus");
    formStatus.innerText = "Sending message...";

    // Prepare the form data to be sent
    const templateParams = {
        user_name: document.getElementById("name").value,
        user_email: document.getElementById("email").value,
        message: document.getElementById("message").value,
        to_email: 'pellurisivasagar@gmail.com'  // Your email address
    };

    // Send the email using EmailJS
    emailjs.send("service_098iew2", "template_45nvhil", templateParams)
        .then(function(response) {
            formStatus.innerText = "Message sent successfully!";
            formStatus.style.color = "green";  // Change text color to green for success
            document.getElementById("contactForm").reset();  // Reset form fields
        }, function(error) {
            formStatus.innerText = "Failed to send message. Please try again.";
            formStatus.style.color = "red";  // Change text color to red for error
            console.error("EmailJS error:", error);
        });
});
