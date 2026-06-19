/**
 * Bhavishya Sharma - Portfolio Cybernetic Interactions
 * Core logic for neural network canvas animation, ticking console clock, and scroll reveals.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================================================
    // 1. TICKING CONSOLE TIME WIDGET
    // ==========================================================================
    const timeWidget = document.getElementById("consoleTime");
    const updateConsoleClock = () => {
        if (!timeWidget) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        // Append timezone info
        timeWidget.textContent = `${timeString} LCL`;
    };
    setInterval(updateConsoleClock, 1000);
    updateConsoleClock(); // Run on load

    // ==========================================================================
    // 2. INTERACTIVE NEURAL NETWORK CANVAS
    // ==========================================================================
    const canvas = document.getElementById("neural-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        let mouse = { x: null, y: null, maxDist: 160 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Soft, slow movement
                this.vx = (Math.random() - 0.5) * 0.45;
                this.vy = (Math.random() - 0.5) * 0.45;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off boundaries
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Restrict coordinate checks
                if (this.x < 0) this.x = 0;
                if (this.x > canvas.width) this.x = canvas.width;
                if (this.y < 0) this.y = 0;
                if (this.y > canvas.height) this.y = canvas.height;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = "#000000";
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            // Dynamically scale particles count with screen width
            const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 80);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw lines connecting close nodes
            const len = particles.length;
            for (let i = 0; i < len; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < len; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        const alpha = (1 - dist / 110) * 0.15;
                        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse cursor
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.maxDist) {
                        const alpha = (1 - dist / mouse.maxDist) * 0.25;
                        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        };

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Initialize
        resizeCanvas();
        animate();
    }

    // ==========================================================================
    // 3. SCROLL REVEAL OBSERVER
    // ==========================================================================
    // Automatically apply class to make HTML look clean
    const targets = document.querySelectorAll(
        "section, .log-row, .project-box, .table-row, .skill-node"
    );
    targets.forEach(el => el.classList.add("reveal"));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -8% 0px", // Trigger when 8% inside window
        threshold: 0.05
    });

    targets.forEach(t => observer.observe(t));

    // ==========================================================================
    // 4. NAV LINK ACTIVE STATE TRACKER
    // ==========================================================================
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    const trackActiveNav = () => {
        const scrollPos = window.scrollY + 140; // Offset for header & top bar

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute("id");

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove("active-nav");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active-nav");
                    }
                });
            }
        });
    };

    window.addEventListener("scroll", trackActiveNav, { passive: true });
    trackActiveNav(); // Call initially

    // ==========================================================================
    // 5. CUSTOM CURSOR FOLLOWER
    // ==========================================================================
    const cursor = document.getElementById("customCursor");
    if (cursor) {
        document.addEventListener("mousemove", (e) => {
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
        });

        const hoverSelectors = "a, button, input, textarea, .project-box, .table-row, .skill-node";
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(hoverSelectors)) {
                cursor.classList.add("hovered");
            }
        });

        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(hoverSelectors)) {
                cursor.classList.remove("hovered");
            }
        });
    }

    // ==========================================================================
    // 6. CONTACT FORM SIMULATED PIPELINE
    // ==========================================================================
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");

    if (contactForm && formStatus) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector(".btn-submit");
            const originalHTML = submitBtn.innerHTML;

            submitBtn.innerHTML = ":SENDING_TRANSMISSION...";
            submitBtn.disabled = true;

            // Simulated transmission pipeline latency
            setTimeout(() => {
                formStatus.textContent = "TRANSMISSION RECEIVED. PIPELINE CONNECTED SUCCESSFULLY.";
                formStatus.className = "form-status success";
                formStatus.style.display = "block";

                submitBtn.innerHTML = ":TRANSMISSION_SENT";

                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                    formStatus.style.display = "none";
                }, 4000);
            }, 1500);
        });
    }
});
