// FTC Automóveis - Modern JavaScript Application
class FTCModernApp {
    constructor() {
        this.currentSection = 'inicio';
        this.currentSlide = 0;
        this.slideInterval = null;
        this.vehicles = { cars: [], jetskis: [] };
        this.filteredVehicles = { cars: [], jetskis: [] };
        this.isAdmin = false;
        this.apiBase = '/api';
        
        this.init();
    }

    async init() {
        // Initialize splash screen
        this.initSplashScreen();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load vehicles data
        await this.loadVehiclesData();
        
        // Initialize hero slider
        this.initHeroSlider();
        
        // Setup navigation
        this.setupNavigation();
        
        // Initialize animations
        this.initAnimations();
        
        // Remove unwanted badges
        this.removeBadges();
    }

    initSplashScreen() {
        setTimeout(() => {
            const splash = document.getElementById('splash');
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }, 2500);
    }

    setupEventListeners() {
        // Navigation toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        navToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
                navMenu.classList.remove('active');
            });
        });

        // Admin login form
        const adminForm = document.getElementById('adminLoginForm');
        adminForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.adminLogin();
        });

        // Contact form
        const contactForm = document.getElementById('contactForm');
        contactForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitContactForm();
        });

        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setupNavigation() {
        // Smooth scroll behavior and section management
        window.addEventListener('scroll', () => {
            this.updateActiveNavigation();
        });
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop <= 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active-section');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active-section');
            this.currentSection = sectionName;

            // Scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });

            // Load section-specific data
            this.loadSectionData(sectionName);
        }
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'carros':
                this.displayCars();
                break;
            case 'jetskis':
                this.displayJetskis();
                break;
            case 'novidades':
                this.displayFeaturedVehicles();
                break;
            case 'admin':
                this.checkAdminStatus();
                break;
        }
    }

    initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    nextSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        
        slides[this.currentSlide].classList.remove('active');
        dots[this.currentSlide]?.classList.remove('active');
        
        this.currentSlide = (this.currentSlide + 1) % slides.length;
        
        slides[this.currentSlide].classList.add('active');
        dots[this.currentSlide]?.classList.add('active');
    }

    currentSlide(n) {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        
        slides[this.currentSlide].classList.remove('active');
        dots[this.currentSlide]?.classList.remove('active');
        
        this.currentSlide = n - 1;
        
        slides[this.currentSlide].classList.add('active');
        dots[this.currentSlide]?.classList.add('active');
        
        // Reset interval
        clearInterval(this.slideInterval);
        this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    }

    // API Methods
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}/${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'include',
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    async loadVehiclesData() {
        try {
            // Load cars
            const carsResponse = await this.apiCall('cars');
            this.vehicles.cars = Array.isArray(carsResponse) ? carsResponse : [];
            this.filteredVehicles.cars = [...this.vehicles.cars];
            
            // Load jetskis
            const jetskisResponse = await this.apiCall('jetskis');
            this.vehicles.jetskis = Array.isArray(jetskisResponse) ? jetskisResponse : [];
            this.filteredVehicles.jetskis = [...this.vehicles.jetskis];
            
            // Populate filters
            this.populateFilters();
            
            // Display featured vehicles
            this.displayFeaturedVehicles();
            
        } catch (error) {
            console.error('Error loading vehicles:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        // Demo data fallback
        this.vehicles.cars = [
            {
                id: 1,
                brand: "BMW",
                year: 2020,
                model: "320i",
                mileage: 45000,
                price: 28500,
                images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop"],
                fuel: "Gasolina",
                transmission: "Automática",
                color: "Preto",
                description: "BMW 320i em excelente estado com todos os extras de série.",
                featured: true
            },
            {
                id: 2,
                brand: "Mercedes-Benz",
                year: 2019,
                model: "C200",
                mileage: 52000,
                price: 32000,
                images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop"],
                fuel: "Gasolina",
                transmission: "Automática",
                color: "Prata",
                description: "Mercedes-Benz C200 com interior em pele e navegação GPS.",
                featured: true
            },
            {
                id: 3,
                brand: "Audi",
                year: 2021,
                model: "A4",
                mileage: 25000,
                price: 35000,
                images: ["https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=500&h=300&fit=crop"],
                fuel: "Diesel",
                transmission: "Automática",
                color: "Branco",
                description: "Audi A4 quase novo com garantia de fábrica ainda válida.",
                featured: true
            }
        ];
        
        this.vehicles.jetskis = [
            {
                id: 1,
                brand: "Yamaha",
                year: 2023,
                model: "VX Cruiser HO",
                hours: 45,
                price: 18500,
                images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop"],
                engine: "1812cc",
                passengers: 3,
                fuel: "Gasolina",
                color: "Azul/Branco",
                description: "Yamaha VX Cruiser HO em excelente estado para passeios familiares.",
                featured: true
            },
            {
                id: 2,
                brand: "Sea-Doo",
                year: 2022,
                model: "GTX 230",
                hours: 78,
                price: 22000,
                images: ["https://images.unsplash.com/photo-1607473129281-bc8e9a88540e?w=500&h=300&fit=crop"],
                engine: "1630cc Rotax",
                passengers: 3,
                fuel: "Gasolina",
                color: "Preto/Amarelo",
                description: "Sea-Doo GTX 230 com sistema de som e GPS integrado.",
                featured: true
            }
        ];
        
        this.filteredVehicles = { ...this.vehicles };
        this.populateFilters();
        this.displayFeaturedVehicles();
    }

    populateFilters() {
        // Car brands
        const carBrands = [...new Set(this.vehicles.cars.map(car => car.brand))].sort();
        const carBrandFilter = document.getElementById('carBrandFilter');
        if (carBrandFilter) {
            carBrandFilter.innerHTML = '<option value="">Marca</option>' + 
                carBrands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        }

        // Car years
        const carYears = [...new Set(this.vehicles.cars.map(car => car.year))].sort((a, b) => b - a);
        const carYearFilter = document.getElementById('carYearFilter');
        if (carYearFilter) {
            carYearFilter.innerHTML = '<option value="">Ano</option>' + 
                carYears.map(year => `<option value="${year}">${year}</option>`).join('');
        }

        // Jetski years
        const jetskiYears = [...new Set(this.vehicles.jetskis.map(j => j.year))].sort((a, b) => b - a);
        const jetskiYearFilter = document.getElementById('jetskiYearFilter');
        if (jetskiYearFilter) {
            jetskiYearFilter.innerHTML = '<option value="">Ano</option>' + 
                jetskiYears.map(year => `<option value="${year}">${year}</option>`).join('');
        }
    }

    displayFeaturedVehicles() {
        const featuredGrid = document.getElementById('featuredVehicles');
        if (!featuredGrid) return;

        const featuredCars = this.vehicles.cars.filter(car => car.featured).slice(0, 2);
        const featuredJetskis = this.vehicles.jetskis.filter(jetski => jetski.featured).slice(0, 2);
        const featured = [...featuredCars, ...featuredJetskis];

        featuredGrid.innerHTML = featured.map(vehicle => this.createVehicleCard(vehicle, 
            this.vehicles.cars.includes(vehicle) ? 'car' : 'jetski')).join('');
    }

    displayCars() {
        const carsGrid = document.getElementById('carsGrid');
        if (!carsGrid) return;

        carsGrid.innerHTML = this.filteredVehicles.cars.length > 0 
            ? this.filteredVehicles.cars.map(car => this.createVehicleCard(car, 'car')).join('')
            : '<div class="no-results">Nenhum carro encontrado com os filtros selecionados.</div>';
    }

    displayJetskis() {
        const jetskisGrid = document.getElementById('jetskisGrid');
        if (!jetskisGrid) return;

        jetskisGrid.innerHTML = this.filteredVehicles.jetskis.length > 0 
            ? this.filteredVehicles.jetskis.map(jetski => this.createVehicleCard(jetski, 'jetski')).join('')
            : '<div class="no-results">Nenhum jet-ski encontrado com os filtros selecionados.</div>';
    }

    createVehicleCard(vehicle, type) {
        const isJetski = type === 'jetski';
        const mainImage = Array.isArray(vehicle.images) ? vehicle.images[0] : vehicle.images;
        
        return `
            <div class="vehicle-card fade-in" onclick="app.showVehicleDetail(${vehicle.id}, '${type}')">
                ${vehicle.featured ? '<div class="featured-badge">Destaque</div>' : ''}
                <img src="${mainImage}" alt="${vehicle.brand} ${vehicle.model}" class="vehicle-image" loading="lazy">
                <div class="vehicle-info">
                    <div class="vehicle-title">${vehicle.brand} ${vehicle.model}</div>
                    <div class="vehicle-details">
                        <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                        <span><i class="fas fa-${isJetski ? 'clock' : 'road'}"></i> ${this.formatNumber(isJetski ? vehicle.hours : vehicle.mileage)} ${isJetski ? 'h' : 'KM'}</span>
                        <span><i class="fas fa-gas-pump"></i> ${vehicle.fuel}</span>
                        <span><i class="fas fa-${isJetski ? 'users' : 'cogs'}"></i> ${isJetski ? vehicle.passengers + ' pax' : vehicle.transmission}</span>
                    </div>
                    <div class="vehicle-price">${this.formatPrice(vehicle.price)}</div>
                </div>
            </div>
        `;
    }

    showVehicleDetail(id, type) {
        const vehicles = type === 'car' ? this.vehicles.cars : this.vehicles.jetskis;
        const vehicle = vehicles.find(v => v.id == id);
        
        if (!vehicle) return;

        const isJetski = type === 'jetski';
        const modal = document.getElementById('vehicleModal');
        const details = document.getElementById('vehicleDetails');
        
        const images = Array.isArray(vehicle.images) ? vehicle.images : [vehicle.images];
        
        details.innerHTML = `
            <div class="vehicle-detail-modern">
                <div class="vehicle-gallery">
                    <div class="main-image">
                        <img src="${images[0]}" alt="${vehicle.brand} ${vehicle.model}" id="mainVehicleImage">
                    </div>
                    ${images.length > 1 ? `
                        <div class="image-thumbnails">
                            ${images.map((img, index) => `
                                <img src="${img}" alt="${vehicle.brand} ${vehicle.model}" 
                                     class="thumbnail ${index === 0 ? 'active' : ''}"
                                     onclick="app.changeMainImage('${img}', this)">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="vehicle-details-modern">
                    <div class="vehicle-header">
                        <h2>${vehicle.brand} ${vehicle.model}</h2>
                        <div class="year-badge">${vehicle.year}</div>
                    </div>
                    
                    <div class="price-section">
                        <div class="price-main">${this.formatPrice(vehicle.price)}</div>
                        <div class="price-note">Financiamento disponível</div>
                    </div>
                    
                    <div class="specs-modern">
                        <div class="spec-item">
                            <div class="spec-icon"><i class="fas fa-${isJetski ? 'clock' : 'road'}"></i></div>
                            <div class="spec-content">
                                <div class="spec-label">${isJetski ? 'Horas de uso' : 'Quilometragem'}</div>
                                <div class="spec-value">${this.formatNumber(isJetski ? vehicle.hours : vehicle.mileage)} ${isJetski ? 'h' : 'KM'}</div>
                            </div>
                        </div>
                        
                        <div class="spec-item">
                            <div class="spec-icon"><i class="fas fa-gas-pump"></i></div>
                            <div class="spec-content">
                                <div class="spec-label">Combustível</div>
                                <div class="spec-value">${vehicle.fuel}</div>
                            </div>
                        </div>
                        
                        <div class="spec-item">
                            <div class="spec-icon"><i class="fas fa-${isJetski ? 'cog' : 'cogs'}"></i></div>
                            <div class="spec-content">
                                <div class="spec-label">${isJetski ? 'Motor' : 'Transmissão'}</div>
                                <div class="spec-value">${isJetski ? vehicle.engine : vehicle.transmission}</div>
                            </div>
                        </div>
                        
                        <div class="spec-item">
                            <div class="spec-icon"><i class="fas fa-palette"></i></div>
                            <div class="spec-content">
                                <div class="spec-label">Cor</div>
                                <div class="spec-value">${vehicle.color}</div>
                            </div>
                        </div>
                        
                        ${isJetski ? `
                        <div class="spec-item">
                            <div class="spec-icon"><i class="fas fa-users"></i></div>
                            <div class="spec-content">
                                <div class="spec-label">Passageiros</div>
                                <div class="spec-value">${vehicle.passengers}</div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="description-modern">
                        <h3>Descrição</h3>
                        <p>${vehicle.description}</p>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn-action btn-primary" onclick="app.reserveVehicle(${vehicle.id}, '${type}')">
                            <i class="fas fa-credit-card"></i>
                            Reservar por 1.000€
                        </button>
                        <button class="btn-action btn-secondary" onclick="app.contactAboutVehicle(${vehicle.id})">
                            <i class="fas fa-phone"></i>
                            Contactar
                        </button>
                        <button class="btn-action btn-accent" onclick="app.showSection('financiamento')">
                            <i class="fas fa-calculator"></i>
                            Simular Financiamento
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .vehicle-detail-modern { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                .vehicle-gallery .main-image img { width: 100%; height: 300px; object-fit: cover; border-radius: 15px; }
                .image-thumbnails { display: flex; gap: 10px; margin-top: 15px; }
                .thumbnail { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; opacity: 0.6; transition: opacity 0.3s; }
                .thumbnail.active, .thumbnail:hover { opacity: 1; }
                .vehicle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .vehicle-header h2 { font-size: 2rem; font-weight: 700; color: var(--primary-color); }
                .year-badge { background: var(--gradient-primary); color: white; padding: 8px 15px; border-radius: 20px; font-weight: 600; }
                .price-section { margin-bottom: 30px; text-align: center; }
                .price-main { font-size: 2.5rem; font-weight: 900; color: var(--secondary-color); }
                .price-note { color: var(--text-gray); font-size: 0.9rem; }
                .specs-modern { display: grid; gap: 15px; margin-bottom: 30px; }
                .spec-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; }
                .spec-icon { width: 40px; height: 40px; background: var(--gradient-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .spec-label { font-size: 0.9rem; color: var(--text-gray); }
                .spec-value { font-weight: 600; color: var(--primary-color); }
                .description-modern h3 { margin-bottom: 15px; color: var(--primary-color); }
                .description-modern p { line-height: 1.6; color: var(--text-gray); }
                .action-buttons { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 30px; }
                .btn-action { padding: 12px 20px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px; }
                .btn-action.btn-primary { background: var(--gradient-primary); color: white; }
                .btn-action.btn-secondary { background: transparent; border: 2px solid var(--primary-color); color: var(--primary-color); }
                .btn-action.btn-accent { background: var(--accent-color); color: white; }
                .btn-action:hover { transform: translateY(-2px); box-shadow: var(--shadow-dark); }
                @media (max-width: 768px) {
                    .vehicle-detail-modern { grid-template-columns: 1fr; }
                    .action-buttons { grid-template-columns: 1fr; }
                }
            </style>
        `;
        
        modal.style.display = 'block';
    }

    changeMainImage(src, thumbnail) {
        document.getElementById('mainVehicleImage').src = src;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    }

    reserveVehicle(id, type) {
        // Placeholder for payment integration
        this.showNotification('🚧 Sistema de pagamento em desenvolvimento!\n\nPara reservar, contacte-nos:\n📱 +351 923 575 015\n📧 info@ftcautomoveis.com', 'info');
        this.closeModal();
    }

    contactAboutVehicle(id) {
        window.open('tel:+351923575015');
    }

    closeModal() {
        document.getElementById('vehicleModal').style.display = 'none';
    }

    // Filters
    filterCars() {
        const brand = document.getElementById('carBrandFilter')?.value || '';
        const year = document.getElementById('carYearFilter')?.value || '';
        const fuel = document.getElementById('carFuelFilter')?.value || '';
        const maxPrice = document.getElementById('carMaxPriceFilter')?.value || '';
        
        this.filteredVehicles.cars = this.vehicles.cars.filter(car => {
            return (!brand || car.brand === brand) &&
                   (!year || car.year.toString() === year) &&
                   (!fuel || car.fuel === fuel) &&
                   (!maxPrice || car.price <= parseInt(maxPrice));
        });
        
        this.displayCars();
    }

    filterJetskis() {
        const brand = document.getElementById('jetskiBrandFilter')?.value || '';
        const year = document.getElementById('jetskiYearFilter')?.value || '';
        const maxHours = document.getElementById('jetskiMaxHoursFilter')?.value || '';
        const maxPrice = document.getElementById('jetskiMaxPriceFilter')?.value || '';
        
        this.filteredVehicles.jetskis = this.vehicles.jetskis.filter(jetski => {
            return (!brand || jetski.brand === brand) &&
                   (!year || jetski.year.toString() === year) &&
                   (!maxHours || jetski.hours <= parseInt(maxHours)) &&
                   (!maxPrice || jetski.price <= parseInt(maxPrice));
        });
        
        this.displayJetskis();
    }

    // Financing Calculator
    calculateFinancing() {
        const vehiclePrice = parseFloat(document.getElementById('vehiclePrice')?.value || 0);
        const downPayment = parseFloat(document.getElementById('downPayment')?.value || 0);
        const loanTerm = parseInt(document.getElementById('loanTerm')?.value || 60);
        
        if (!vehiclePrice || vehiclePrice <= 0) {
            this.showNotification('Por favor, insira um valor válido para o veículo.', 'warning');
            return;
        }
        
        const amountToFinance = vehiclePrice - downPayment;
        if (amountToFinance <= 0) {
            this.showNotification('O valor da entrada não pode ser superior ao preço do veículo.', 'warning');
            return;
        }
        
        const annualRate = 0.085; // 8.5% TAN
        const monthlyRate = annualRate / 12;
        
        const monthlyPayment = (amountToFinance * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                              (Math.pow(1 + monthlyRate, loanTerm) - 1);
        
        const totalPayment = monthlyPayment * loanTerm + downPayment;
        
        // Update results
        const amountElement = document.getElementById('amountToFinance');
        const monthlyElement = document.getElementById('monthlyPayment');
        const totalElement = document.getElementById('totalPayment');
        const resultsElement = document.getElementById('financingResults');
        
        if (amountElement) amountElement.textContent = this.formatPrice(amountToFinance);
        if (monthlyElement) monthlyElement.textContent = this.formatPrice(monthlyPayment);
        if (totalElement) totalElement.textContent = this.formatPrice(totalPayment);
        if (resultsElement) resultsElement.style.display = 'block';
    }

    // Admin Functions
    async adminLogin() {
        const username = document.getElementById('adminUsername')?.value || '';
        const password = document.getElementById('adminPassword')?.value || '';
        
        if (!username || !password) {
            this.showNotification('Por favor, preencha todos os campos.', 'warning');
            return;
        }
        
        try {
            const response = await this.apiCall('admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            
            if (response.success) {
                this.isAdmin = true;
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                await this.loadAdminData();
                this.showNotification('Login realizado com sucesso!', 'success');
            } else {
                this.showNotification('Credenciais inválidas!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    }

    async checkAdminStatus() {
        try {
            const response = await this.apiCall('admin/status');
            if (response.logged_in) {
                this.isAdmin = true;
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                await this.loadAdminData();
            }
        } catch (error) {
            console.log('Not logged in as admin');
        }
    }

    async loadAdminData() {
        try {
            const statsResponse = await this.apiCall('admin/stats');
            this.displayAdminStats(statsResponse.stats);
            this.showAdminTab('cars');
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    displayAdminStats(stats) {
        const statsContainer = document.getElementById('dashboardStats');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.cars_count}</div>
                <div class="stat-label">Carros</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.jetskis_count}</div>
                <div class="stat-label">Jet-Skis</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.formatPrice(stats.avg_car_price)}</div>
                <div class="stat-label">Preço Médio Carros</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.formatPrice(stats.avg_jetski_price)}</div>
                <div class="stat-label">Preço Médio Jet-Skis</div>
            </div>
        `;
    }

    showAdminTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event?.target?.classList.add('active');
        
        const content = document.getElementById('adminContent');
        if (!content) return;
        
        if (tab === 'cars') {
            content.innerHTML = this.createAdminVehiclesTab('cars');
        } else if (tab === 'jetskis') {
            content.innerHTML = this.createAdminVehiclesTab('jetskis');
        }
    }

    createAdminVehiclesTab(type) {
        const vehicles = type === 'cars' ? this.vehicles.cars : this.vehicles.jetskis;
        const title = type === 'cars' ? 'Carros' : 'Jet-Skis';
        const icon = type === 'cars' ? 'car' : 'ship';
        
        return `
            <div class="admin-tab-content">
                <div class="tab-header">
                    <h3><i class="fas fa-${icon}"></i> Gestão de ${title}</h3>
                    <button class="btn-primary" onclick="app.showAddVehicleForm('${type}')">
                        <i class="fas fa-plus"></i> Adicionar ${type === 'cars' ? 'Carro' : 'Jet-Ski'}
                    </button>
                </div>
                <div class="admin-vehicles-grid">
                    ${vehicles.map(vehicle => `
                        <div class="admin-vehicle-card">
                            <img src="${Array.isArray(vehicle.images) ? vehicle.images[0] : vehicle.images}" alt="${vehicle.brand} ${vehicle.model}">
                            <div class="admin-vehicle-info">
                                <h4>${vehicle.brand} ${vehicle.model} (${vehicle.year})</h4>
                                <p class="admin-price">${this.formatPrice(vehicle.price)}</p>
                                <p class="admin-details">${type === 'cars' ? this.formatNumber(vehicle.mileage) + ' KM' : vehicle.hours + ' horas'}</p>
                                ${vehicle.featured ? '<span class="featured-tag">Destaque</span>' : ''}
                            </div>
                            <div class="admin-actions">
                                <button class="btn-edit" onclick="app.editVehicle(${vehicle.id}, '${type}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-delete" onclick="app.deleteVehicle(${vehicle.id}, '${type}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <style>
                .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .tab-header h3 { color: white; font-size: 1.3rem; display: flex; align-items: center; gap: 10px; }
                .admin-vehicles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .admin-vehicle-card { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; border: 1px solid rgba(255,255,255,0.1); }
                .admin-vehicle-card img { width: 100%; height: 150px; object-fit: cover; border-radius: 10px; margin-bottom: 15px; }
                .admin-vehicle-info h4 { color: white; margin-bottom: 10px; }
                .admin-price { color: var(--secondary-color); font-weight: 600; font-size: 1.1rem; }
                .admin-details { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
                .featured-tag { background: var(--accent-color); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.7rem; }
                .admin-actions { display: flex; gap: 10px; margin-top: 15px; }
                .btn-edit, .btn-delete { padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer; transition: var(--transition); }
                .btn-edit { background: #3498db; color: white; }
                .btn-delete { background: var(--accent-color); color: white; }
                .btn-edit:hover, .btn-delete:hover { transform: translateY(-2px); }
            </style>
        `;
    }

    showAddVehicleForm(type) {
        this.showNotification('🚧 Formulário de adição em desenvolvimento!\n\nPara adicionar veículos, contacte o desenvolvedor.', 'info');
    }

    editVehicle(id, type) {
        this.showNotification(`🚧 Edição em desenvolvimento!\n\nID: ${id}, Tipo: ${type}`, 'info');
    }

    async deleteVehicle(id, type) {
        if (!confirm(`Tem certeza que deseja eliminar este ${type === 'car' ? 'carro' : 'jet-ski'}?`)) {
            return;
        }
        
        try {
            const endpoint = type === 'car' ? 'cars' : 'jetskis';
            await this.apiCall(endpoint, {
                method: 'DELETE',
                body: `id=${id}`,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            await this.loadVehiclesData();
            await this.loadAdminData();
            this.showNotification('Veículo eliminado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            this.showNotification('Erro ao eliminar veículo.', 'error');
        }
    }

    async logout() {
        try {
            await this.apiCall('admin/logout', { method: 'POST' });
            this.isAdmin = false;
            document.getElementById('adminLogin').style.display = 'block';
            document.getElementById('adminDashboard').style.display = 'none';
            document.getElementById('adminUsername').value = '';
            document.getElementById('adminPassword').value = '';
            this.showNotification('Sessão encerrada com sucesso!', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Contact Form
    submitContactForm() {
        this.showNotification('🚧 Formulário de contacto em desenvolvimento!\n\nPara enviar mensagem:\n📱 +351 923 575 015\n📧 info@ftcautomoveis.com', 'info');
    }

    // Animations
    initAnimations() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .vehicle-card, .contact-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Utility Functions
    formatPrice(price) {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price || 0);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('pt-PT').format(number || 0);
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            white-space: pre-line;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    removeBadges() {
        // Remove Emergent badges
        setInterval(() => {
            document.querySelectorAll('div[style*="position: fixed"][style*="bottom"][style*="right"], .emergent-badge, [class*="emergent"], [id*="emergent"]').forEach(el => {
                if (el.textContent.includes('Made with') || el.textContent.includes('Emergent')) {
                    el.remove();
                }
            });
        }, 500);
    }
}

// Global functions for HTML events
window.showSection = (section) => window.app.showSection(section);
window.currentSlide = (n) => window.app.currentSlide(n);
window.filterCars = () => window.app.filterCars();
window.filterJetskis = () => window.app.filterJetskis();
window.calculateFinancing = () => window.app.calculateFinancing();
window.closeModal = () => window.app.closeModal();
window.showAdminTab = (tab) => window.app.showAdminTab(tab);
window.logout = () => window.app.logout();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FTCModernApp();
});

// Handle page visibility for slider
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (window.app?.slideInterval) {
            clearInterval(window.app.slideInterval);
        }
    } else {
        if (window.app) {
            window.app.initHeroSlider();
        }
    }
});