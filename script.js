// script.js
// Responsável por interatividade e animações

document.addEventListener('DOMContentLoaded', () => {
    
    // Lógica do Menu Mobile Toggle (Drawer)
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuClose = document.getElementById('menuClose');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    const closeMenu = () => {
        if (menuToggle) menuToggle.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }

    if (mobileMenu) {
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // Animações de Scroll via Intersection Observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const targets = document.querySelectorAll('.observe');
    targets.forEach(target => observer.observe(target));

    // Atualiza o ano no footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Interação do Ecossistema (Hover)
    const ecoSystem = document.querySelector('.eco-ecosystem');
    if (ecoSystem) {
        const nodes = ecoSystem.querySelectorAll('.eco-node');
        nodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                ecoSystem.classList.add('hovering');
                node.classList.add('active');
                const nodeClass = node.classList[1]; 
                const lineNum = nodeClass.split('-')[1];
                const line = ecoSystem.querySelector(`.line-${lineNum}`);
                if (line) line.classList.add('active-line');
            });
            node.addEventListener('mouseleave', () => {
                ecoSystem.classList.remove('hovering');
                node.classList.remove('active');
                const nodeClass = node.classList[1];
                const lineNum = nodeClass.split('-')[1];
                const line = ecoSystem.querySelector(`.line-${lineNum}`);
                if (line) line.classList.remove('active-line');
            });
        });
    }

    // =========================================
    // PAISAGEM DIGITAL - Seção Territórios
    // =========================================
    const terrCanvas = document.getElementById('terr-canvas');
    if (terrCanvas) {
        const ctx = terrCanvas.getContext('2d');
        let width, height, particles = [];
        let mouse = { x: 0, y: 0 };
        let animationId = null;
        let isAnimating = false;
        let time = 0;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function resize() {
            // Usar offsetWidth/offsetHeight garante o tamanho real do layout sem ser afetado pelo scale do CSS
            width = terrCanvas.offsetWidth;
            height = terrCanvas.offsetHeight;
            
            // Previne erros caso o elemento ainda não tenha tamanho na tela
            if (width === 0 || height === 0) return; 
            
            terrCanvas.width = width * window.devicePixelRatio;
            terrCanvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            initParticles();
        }

        function initParticles() {
            particles = [];
            const isMobile = window.innerWidth < 968;
            const spacing = isMobile ? 35 : 25; // Menos partículas no mobile
            const cols = Math.ceil(width / spacing) + 2;
            const rows = Math.ceil(height / spacing) + 2;
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    particles.push({
                        baseX: i * spacing,
                        baseY: j * spacing,
                        depth: Math.random(),
                        phase: Math.random() * Math.PI * 2,
                        isPink: Math.random() > 0.92 // 8% de chance de ser rosa
                    });
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            time += 0.005; // Velocidade lenta

            const parallaxX = (mouse.x - width / 2) * 0.03;
            const parallaxY = (mouse.y - height / 2) * 0.03;

            particles.forEach(p => {
                const wave1 = Math.sin((p.baseX / 60) + time * 2 + p.phase) * 15;
                const wave2 = Math.cos((p.baseY / 50) + time * 1.5 + p.phase) * 15;
                
                const x = p.baseX + wave1 + (parallaxX * p.depth);
                const y = p.baseY + wave2 + (parallaxY * p.depth);

                const size = 1 + p.depth * 2.5;
                const opacity = 0.15 + p.depth * 0.45;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                
                if (p.isPink) {
                    ctx.fillStyle = `rgba(254, 44, 85, ${opacity})`;
                    ctx.shadowColor = 'rgba(254, 44, 85, 0.8)';
                } else {
                    ctx.fillStyle = `rgba(37, 244, 238, ${opacity})`;
                    ctx.shadowColor = 'rgba(37, 244, 238, 0.8)';
                }
                ctx.shadowBlur = size * 2;
                ctx.fill();
                ctx.shadowBlur = 0; 
            });

            if (isAnimating) {
                animationId = requestAnimationFrame(animate);
            }
        }

        const wrapper = terrCanvas.closest('.terr-landscape-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mousemove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });
        }

        const landscapeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !prefersReducedMotion) {
                    if (!isAnimating) {
                        isAnimating = true;
                        animate();
                    }
                } else {
                    isAnimating = false;
                    if (animationId) cancelAnimationFrame(animationId);
                }
            });
        }, { threshold: 0.1 });

        window.addEventListener('resize', resize);
        resize();
        landscapeObserver.observe(terrCanvas);

        if (prefersReducedMotion) {
            animate();
            isAnimating = false;
            if (animationId) cancelAnimationFrame(animationId);
        }
    }






        // =========================================
    // CARROSSEL DE MÓDULOS (Loop Infinito)
    // =========================================
    const sliderTrack = document.querySelector('.modules-track');
    if (sliderTrack) {
        const dots = document.querySelectorAll('.slider-dots .dot');
        let currentSlide = 0;
        let autoPlayInterval;

        const goToSlide = (index) => {
            currentSlide = index;
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentSlide].classList.add('active');
        };

        const nextSlide = () => {
            let next = currentSlide + 1;
            if (next >= dots.length) next = 0; // Volta para o início (Loop)
            goToSlide(next);
        };

        // Inicia o loop automático (muda a cada 4 segundos)
        const startAutoPlay = () => {
            autoPlayInterval = setInterval(nextSlide, 4000);
        };

        // Permite clicar nas bolinhas
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                clearInterval(autoPlayInterval); // Para o automático ao clicar
                goToSlide(parseInt(e.target.dataset.slide));
                startAutoPlay(); // Reinicia o automático
            });
        });

        startAutoPlay();
    }






























    // =========================================
    // CARROSSEL INFINITO + ARRASTÁVEL + LIGHTBOX
    // =========================================
    const scrollContainer = document.querySelector('.testimonials-scroll');
    const progressFill = document.querySelector('.progress-bar-fill-pink');

    if (scrollContainer) {
        // 1. Duplica os cards para o loop infinito
        const cards = scrollContainer.querySelectorAll('.testimonial-card');
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            scrollContainer.appendChild(clone);
        });

        let isDown = false;
        let startX, scrollLeft;
        let hasMoved = false;
        let autoPlay = true;
        let animationFrame;

        // 2. Auto-Scroll (Loop)
        const autoScroll = () => {
            if (autoPlay && !isDown) {
                scrollContainer.scrollLeft += 1.2; // Velocidade suave
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
                    scrollContainer.scrollLeft = 0;
                }
                updateProgressBar();
            }
            animationFrame = requestAnimationFrame(autoScroll);
        };

        // 3. Barra de Progresso
        function updateProgressBar() {
            const maxScroll = scrollContainer.scrollWidth / 2 - scrollContainer.clientWidth;
            if (maxScroll <= 0) return;
            const percent = scrollContainer.scrollLeft / maxScroll;
            const translateX = percent * 70;
            progressFill.style.transform = `translateX(${translateX}%)`;
        }

        // 4. Arraste ONLY Desktop (Mouse) - CORRIGIDO PARA NÃO TRAVAR O SITE
        scrollContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            hasMoved = false;
            autoPlay = false;
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
        });

        // O mousemove e o mouseup agora ouvem a janela (window) inteira!
        // Assim, não importa onde você solte o mouse, ele destrava.
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            if (Math.abs(walk) > 5) hasMoved = true; // Se mexeu, não é clique
            scrollContainer.scrollLeft = scrollLeft - walk;
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                setTimeout(() => { autoPlay = true; }, 2000);
            }
        });

        // 5. Pausar no Mobile (Toque)
        scrollContainer.addEventListener('touchstart', () => {
            autoPlay = false;
            hasMoved = false;
        }, { passive: true });

        scrollContainer.addEventListener('touchmove', () => {
            hasMoved = true; // Se rolou com o dedo, não é clique
        }, { passive: true });

        scrollContainer.addEventListener('touchend', () => {
            setTimeout(() => { autoPlay = true; }, 3000);
        }, { passive: true });

        // 6. Lightbox (Abrir Imagem)
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxClose = document.getElementById('lightboxClose');

        scrollContainer.addEventListener('click', (e) => {
            // Se a pessoa arrastou, cancela o clique
            if (hasMoved) return;

            // Se clicou na imagem ou no card
            const card = e.target.closest('.testimonial-card');
            if (card) {
                const img = card.querySelector('img');
                if (img) {
                    lightboxImage.src = img.src;
                    lightboxModal.classList.add('active');
                    autoPlay = false; // Pausa o carrossel
                }
            }
        });

        // Fechar Lightbox
        const closeLightbox = () => {
            lightboxModal.classList.remove('active');
            setTimeout(() => { autoPlay = true; }, 1000);
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });

        // Inicia
        autoScroll();
    }










    // =========================================
    // FAQ (ACORDEÃO)
    // =========================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fecha todos os outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Abre/Fecha o item clicado
            item.classList.toggle('active');
        });
    });




































});