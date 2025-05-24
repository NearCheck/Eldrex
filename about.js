        const securityConfig = {
            restricted: true, 
            verificationMethod: 'prompt',
            password: 'trustno1', 
            localStorageKey: 'eldrex_about_access_granted',
            sessionTimeout: 60 * 60 * 1000,
            maxAttempts: 3,
            lockoutTime: 5 * 60 * 1000 
        };

        const contentData = {
            aboutSections: [
                "Hi, I’m Eldrex Delos Reyes Bula. I’m just a quiet person who enjoys thinking a lot. I don’t always say much, but my mind is always running. I like asking questions in my head, wondering how things really work. It’s not just about fixing things, but understanding them. And if there’s a way to make something better for someone else, I’ll always want to try.",

                "I’ve never been the type to chase attention. I don’t like showing off or proving something just to feel ahead. I enjoy learning, not just with tools and tech, but also by watching how people act, how they feel, and what makes things feel good to use. I notice little things that many don’t, and somehow those little things give me big ideas.",

                "Even when things get hard, I try not to lose myself. I’ve been through moments where I felt stuck or behind, but I’ve learned to stay calm and patient. I know I’m still growing. I make mistakes, I get confused sometimes, but I always try to do better than I did yesterday. That’s enough for me.",

                "I don’t have everything figured out yet, but I do have a vision. I want to create things that are simple, thoughtful, and useful. Not perfect, just real. I believe that one day, even the ideas I thought were small might become something someone out there truly needs. And maybe, that’s where I’ll find my place."
            ],
            quotes: [{
                    text: "Crazy? Maybe. But I'd rather learn passionately than memorize mindlessly.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "The more we think, the more risks we understand, but sometimes we're quick to regret instead of embracing them.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "An old book might look like trash, yet it has the power to change lives, even if people can’t see its worth at first glance.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "Sometimes, it's people themselves who make things seem impossible.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "Still Be the Blue",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "I serve people not a company",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "Numbers may define you, but it's your will to give them meaning.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "A man who can do what he wants, does what he wants.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "We lose not because we have little, but because we expect nothing more.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "Create what others can’t see—because they won’t know they needed it until it’s here.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "Your limits aren’t real if you’re the one writing the rules.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "I never asked for attention. I just made things impossible to ignore.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "I didn’t say it. I didn’t do it. But that doesn’t mean I didn’t mean it with all of me.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "To own your information is not a feature—it is a right that should never be questioned.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "Change is our only goal, and that’s why we're here to create a new story and become part of history.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "To exist is to question; to question is to live. And if all else is illusion, let my curiosity be real.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "If life is a labyrinth of illusions, then perhaps my purpose is not to escape, but to wander. To question without answer, to search without end—this may be the only truth we ever know.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "I’m in love—not with you, but with the essence of who you are.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "The cost of convenience should never be the loss of control.",
                    author: "Eldrex Delos Reyes Bula"
                },
                {
                    text: "A mother’s gift isn’t measured by how it looks, but by the love that came with it.",
                    author: "Eldrex Delos Reyes Bula"
                }
            ]
        };

        let securityState = {
            attempts: 0,
            locked: false,
            lastAttempt: null
        };

        let restrictedCover, verifyAccessBtn;

        function createQuoteElement(quote, index) {
            const quoteElement = document.createElement('div');
            quoteElement.className = 'quote';
            quoteElement.dataset.quoteId = index;
            quoteElement.innerHTML = `
            "${quote.text}"
            <span class="quote-author">— ${quote.author}</span>
        `;
            quoteElement.style.animation = `slideUpFadeIn 0.6s ${1.8 + (index * 0.2)}s forwards`;
            return quoteElement;
        }

        function displayQuotes() {
            const quotesContainer = document.querySelector('.quotes-container');
            if (!quotesContainer) return;

            quotesContainer.innerHTML = '';
            contentData.quotes.forEach((quote, index) => {
                quotesContainer.appendChild(createQuoteElement(quote, index));
            });
        }

        function loadContent() {
            const aboutContentElements = [
                document.getElementById('aboutContent1'),
                document.getElementById('aboutContent2'),
                document.getElementById('aboutContent3'),
                document.getElementById('aboutContent4')
            ];

            aboutContentElements.forEach((el, index) => {
                if (el && contentData.aboutSections[index]) {
                    el.textContent = contentData.aboutSections[index];
                }
            });

            displayQuotes();
        }

        function checkAccess() {
            if (!securityConfig.restricted) return true;

            const accessData = localStorage.getItem(securityConfig.localStorageKey);
            if (!accessData) return false;

            try {
                const {
                    timestamp
                } = JSON.parse(accessData);
                const currentTime = Date.now();

                if (currentTime - timestamp < securityConfig.sessionTimeout) {
                    return true;
                }
                localStorage.removeItem(securityConfig.localStorageKey);
            } catch (e) {
                console.error('Error parsing access data:', e);
            }
            return false;
        }

        function grantAccess() {
            const accessData = {
                timestamp: Date.now()
            };
            localStorage.setItem(securityConfig.localStorageKey, JSON.stringify(accessData));
            if (restrictedCover) restrictedCover.classList.add('hidden');
        }

        function verifyAccess() {
            if (securityState.locked) {
                const currentTime = Date.now();
                if (currentTime - securityState.lastAttempt < securityConfig.lockoutTime) {
                    alert(`Too many attempts. Please try again in ${securityConfig.lockoutTime / 60000} minutes.`);
                    return;
                }
                securityState.locked = false;
                securityState.attempts = 0;
            }

            if (securityConfig.verificationMethod === 'password') {
                const password = prompt('Enter access password:');
                if (password === securityConfig.password) {
                    grantAccess();
                    return;
                }

                securityState.attempts++;
                securityState.lastAttempt = Date.now();

                if (securityState.attempts >= securityConfig.maxAttempts) {
                    securityState.locked = true;
                    alert(`Too many incorrect attempts. Access locked for ${securityConfig.lockoutTime / 60000} minutes.`);
                } else {
                    alert('Incorrect password. Please try again.');
                }
            } else {
                if (confirm('Are you authorized to view this content?')) {
                    grantAccess();
                }
            }
        }

        function initReadMore() {
            const readMoreBtn = document.querySelector('.read-more-btn');
            const hiddenContent = document.querySelector('.hidden-content');

            if (!readMoreBtn || !hiddenContent) return;

            const toggleContent = (isExpanded) => {
                if (isExpanded) {
                    hiddenContent.classList.remove('active');
                    readMoreBtn.innerHTML = `
                    <span>Read More</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                `;
                    readMoreBtn.setAttribute('aria-expanded', 'false');
                } else {
                    hiddenContent.classList.add('active');
                    readMoreBtn.innerHTML = `
                    <span>Read Less</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                `;
                    readMoreBtn.setAttribute('aria-expanded', 'true');

                    setTimeout(() => {
                        readMoreBtn.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }, 300);
                }
            };

            readMoreBtn.addEventListener('click', () => {
                toggleContent(hiddenContent.classList.contains('active'));
            });

            readMoreBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleContent(hiddenContent.classList.contains('active'));
                }
            });
        }

        function init() {
            const yearElement = document.getElementById('current-year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }

            restrictedCover = document.getElementById('restrictedCover');
            verifyAccessBtn = document.getElementById('verifyAccessBtn');

            if (securityConfig.restricted && !checkAccess()) {
                if (restrictedCover) restrictedCover.classList.remove('hidden');
                if (verifyAccessBtn) verifyAccessBtn.addEventListener('click', verifyAccess);
            } else if (restrictedCover) {
                restrictedCover.classList.add('hidden');
            }

            loadContent();
            initReadMore();

            setTimeout(() => {
                const loadingContainer = document.querySelector('.loading-container');
                if (loadingContainer) loadingContainer.classList.add('hidden');
            }, 1500);

            window.addEventListener('beforeunload', () => {
                if (document.body) {
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.3s ease';
                }
            });
        }

        document.addEventListener('DOMContentLoaded', init);
