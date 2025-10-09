// FTC Automóveis - Enhanced Admin Panel avec Google Sheets Integration

class AdminEnhanced {
    constructor() {
        this.googleSheetId = null; // À configurer
        this.syncInterval = null;
        this.pendingVehicles = [];
        this.uploadedImages = {};
        
        this.initGoogleSheets();
    }

    // Google Sheets Integration
    initGoogleSheets() {
        // Configuration Google Sheets
        this.googleConfig = {
            apiKey: 'YOUR_GOOGLE_API_KEY', // À configurer par l'utilisateur
            sheetId: 'YOUR_SHEET_ID',      // À configurer par l'utilisateur
            range: 'Sheet1!A:Z'            // Configurable
        };
    }

    async syncWithGoogleSheets() {
        if (!this.googleConfig.apiKey || !this.googleConfig.sheetId) {
            this.showNotification('Configuration Google Sheets manquante', 'warning');
            return;
        }

        this.showSyncStatus('Synchronisation en cours...', true);
        
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.googleConfig.sheetId}/values/${this.googleConfig.range}?key=${this.googleConfig.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.values && data.values.length > 1) {
                const headers = data.values[0];
                const rows = data.values.slice(1);
                
                const newVehicles = this.processSheetData(headers, rows);
                await this.updatePendingVehicles(newVehicles);
                
                this.showSyncStatus('Synchronisation terminée', false);
                this.showNotification(`${newVehicles.length} nouveaux véhicules synchronisés`, 'success');
            }
        } catch (error) {
            console.error('Erreur de synchronisation:', error);
            this.showSyncStatus('Erreur de synchronisation', false);
            this.showNotification('Erreur lors de la synchronisation', 'error');
        }
    }

    processSheetData(headers, rows) {
        const vehicles = [];
        
        rows.forEach((row, index) => {
            if (row.length < headers.length) return; // Skip incomplete rows
            
            const vehicle = {};
            headers.forEach((header, i) => {
                const normalizedHeader = this.normalizeHeader(header);
                vehicle[normalizedHeader] = row[i] || '';
            });
            
            // Vérifier si c'est un nouveau véhicule
            if (this.isNewVehicle(vehicle)) {
                vehicle.id = `sheet_${Date.now()}_${index}`;
                vehicle.status = 'pending';
                vehicle.source = 'google_sheets';
                vehicle.images = [];
                vehicles.push(vehicle);
            }
        });
        
        return vehicles;
    }

    normalizeHeader(header) {
        const mapping = {
            'marque': 'brand',
            'brand': 'brand',
            'modele': 'model',
            'model': 'model',
            'année': 'year',
            'year': 'year',
            'anno': 'year',
            'prix': 'price',
            'price': 'price',
            'preço': 'price',
            'kilometrage': 'mileage',
            'mileage': 'mileage',
            'km': 'mileage',
            'combustible': 'fuel',
            'fuel': 'fuel',
            'carburant': 'fuel',
            'transmission': 'transmission',
            'boite': 'transmission',
            'couleur': 'color',
            'color': 'color',
            'cor': 'color',
            'description': 'description',
            'desc': 'description',
            'horas': 'hours',
            'hours': 'hours',
            'heures': 'hours',
            'motor': 'engine',
            'engine': 'engine',
            'moteur': 'engine',
            'passagers': 'passengers',
            'passengers': 'passengers',
            'passageiros': 'passengers'
        };
        
        return mapping[header.toLowerCase()] || header.toLowerCase();
    }

    isNewVehicle(vehicle) {
        // Vérifier si le véhicule existe déjà
        const existing = this.pendingVehicles.find(v => 
            v.brand === vehicle.brand && 
            v.model === vehicle.model && 
            v.year === vehicle.year
        );
        return !existing && vehicle.brand && vehicle.model;
    }

    async updatePendingVehicles(newVehicles) {
        this.pendingVehicles = [...this.pendingVehicles, ...newVehicles];
        this.displayPendingVehicles();
    }

    displayPendingVehicles() {
        const container = document.getElementById('pendingVehiclesContainer');
        if (!container) return;

        if (this.pendingVehicles.length === 0) {
            container.innerHTML = `
                <div class="no-pending">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: rgba(255,255,255,0.3); margin-bottom: 20px;"></i>
                    <p style="color: rgba(255,255,255,0.7);">Aucun véhicule en attente</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.pendingVehicles.map(vehicle => this.createPendingVehicleCard(vehicle)).join('');
    }

    createPendingVehicleCard(vehicle) {
        const isJetski = vehicle.hours !== undefined;
        
        return `
            <div class="vehicle-management-card" data-vehicle-id="${vehicle.id}">
                <div class="vehicle-management-header">
                    <div class="vehicle-management-info">
                        <h4>${vehicle.brand} ${vehicle.model}</h4>
                        <div class="price">${this.formatPrice(vehicle.price)}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                            ${vehicle.year} • ${isJetski ? vehicle.hours + 'h' : this.formatNumber(vehicle.mileage) + ' KM'}
                        </div>
                    </div>
                    <div class="status-badge status-pending">
                        <i class="fas fa-clock"></i> En attente
                    </div>
                </div>
                
                <div class="vehicle-details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                    <div>Combustible: ${vehicle.fuel || 'N/A'}</div>
                    <div>${isJetski ? 'Moteur' : 'Transmission'}: ${isJetski ? vehicle.engine || 'N/A' : vehicle.transmission || 'N/A'}</div>
                    <div>Couleur: ${vehicle.color || 'N/A'}</div>
                    ${isJetski ? `<div>Passagers: ${vehicle.passengers || 'N/A'}</div>` : ''}
                </div>
                
                ${vehicle.description ? `
                    <div class="vehicle-description" style="margin-bottom: 20px;">
                        <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; line-height: 1.4;">${vehicle.description}</p>
                    </div>
                ` : ''}
                
                <div class="image-upload-section">
                    <h5 style="color: white; margin-bottom: 15px;">
                        <i class="fas fa-images"></i> Photos (${(this.uploadedImages[vehicle.id] || []).length}/10)
                    </h5>
                    <div class="image-upload-area" onclick="app.admin.triggerImageUpload('${vehicle.id}')">
                        <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                        <div class="upload-text">Cliquer ou glisser les photos ici</div>
                        <div class="upload-hint">JPG, PNG max 5MB chacune</div>
                    </div>
                    <input type="file" id="imageUpload_${vehicle.id}" multiple accept="image/*" style="display: none;" onchange="app.admin.handleImageUpload(event, '${vehicle.id}')">
                    
                    <div class="image-preview-grid" id="imagePreview_${vehicle.id}">
                        ${(this.uploadedImages[vehicle.id] || []).map((img, index) => `
                            <div class="image-preview-item">
                                <img src="${img.url}" alt="Preview">
                                <button class="image-remove-btn" onclick="app.admin.removeImage('${vehicle.id}', ${index})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="vehicle-management-actions">
                    <button class="btn-modern btn-primary-modern" onclick="app.admin.editVehicleDetails('${vehicle.id}')">
                        <i class="fas fa-edit"></i> Éditer
                    </button>
                    <button class="btn-modern btn-success-modern" onclick="app.admin.publishVehicle('${vehicle.id}')" 
                            ${(this.uploadedImages[vehicle.id] || []).length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Publier
                    </button>
                    <button class="btn-modern btn-danger-modern" onclick="app.admin.rejectVehicle('${vehicle.id}')">
                        <i class="fas fa-trash"></i> Rejeter
                    </button>
                </div>
            </div>
        `;
    }

    triggerImageUpload(vehicleId) {
        document.getElementById(`imageUpload_${vehicleId}`).click();
    }

    handleImageUpload(event, vehicleId) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('Fichier trop volumineux (max 5MB)', 'error');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                this.showNotification('Format non supporté', 'error');
                return;
            }
            
            this.uploadImage(file, vehicleId);
        });
    }

    uploadImage(file, vehicleId) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            if (!this.uploadedImages[vehicleId]) {
                this.uploadedImages[vehicleId] = [];
            }
            
            if (this.uploadedImages[vehicleId].length >= 10) {
                this.showNotification('Maximum 10 images par véhicule', 'warning');
                return;
            }
            
            this.uploadedImages[vehicleId].push({
                url: e.target.result,
                file: file,
                name: file.name
            });
            
            this.updateImagePreview(vehicleId);
            this.updatePublishButton(vehicleId);
        };
        
        reader.readAsDataURL(file);
    }

    removeImage(vehicleId, index) {
        if (this.uploadedImages[vehicleId]) {
            this.uploadedImages[vehicleId].splice(index, 1);
            this.updateImagePreview(vehicleId);
            this.updatePublishButton(vehicleId);
        }
    }

    updateImagePreview(vehicleId) {
        const container = document.getElementById(`imagePreview_${vehicleId}`);
        if (!container) return;

        const images = this.uploadedImages[vehicleId] || [];
        container.innerHTML = images.map((img, index) => `
            <div class="image-preview-item">
                <img src="${img.url}" alt="Preview">
                <button class="image-remove-btn" onclick="app.admin.removeImage('${vehicleId}', ${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Update counter
        const counter = container.closest('.vehicle-management-card').querySelector('h5');
        if (counter) {
            counter.innerHTML = `<i class="fas fa-images"></i> Photos (${images.length}/10)`;
        }
    }

    updatePublishButton(vehicleId) {
        const publishBtn = document.querySelector(`[onclick="app.admin.publishVehicle('${vehicleId}')"]`);
        if (publishBtn) {
            const hasImages = (this.uploadedImages[vehicleId] || []).length > 0;
            publishBtn.disabled = !hasImages;
            publishBtn.style.opacity = hasImages ? '1' : '0.5';
        }
    }

    editVehicleDetails(vehicleId) {
        const vehicle = this.pendingVehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        const modal = this.createEditModal(vehicle);
        document.body.appendChild(modal);
    }

    createEditModal(vehicle) {
        const isJetski = vehicle.hours !== undefined;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container" style="max-width: 800px;">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-content">
                    <h2 style="color: var(--primary-color); margin-bottom: 30px;">
                        <i class="fas fa-edit"></i> Éditer ${vehicle.brand} ${vehicle.model}
                    </h2>
                    
                    <form class="form-modern" onsubmit="app.admin.saveVehicleEdits(event, '${vehicle.id}')">
                        <div class="form-grid">
                            <div class="form-group-modern">
                                <label class="form-label-modern">
                                    <i class="fas fa-tag"></i> Marque
                                </label>
                                <input type="text" class="form-input-modern" name="brand" value="${vehicle.brand}" required>
                            </div>
                            
                            <div class="form-group-modern">
                                <label class="form-label-modern">
                                    <i class="fas fa-car"></i> Modèle
                                </label>
                                <input type="text" class="form-input-modern" name="model" value="${vehicle.model}" required>
                            </div>
                            
                            <div class="form-group-modern">
                                <label class="form-label-modern">
                                    <i class="fas fa-calendar"></i> Année
                                </label>
                                <input type="number" class="form-input-modern" name="year" value="${vehicle.year}" min="1990" max="2025" required>
                            </div>
                            
                            <div class="form-group-modern">
                                <label class="form-label-modern">
                                    <i class="fas fa-euro-sign"></i> Prix (€)
                                </label>
                                <input type="number" class="form-input-modern" name="price" value="${vehicle.price}" min="0" required>
                            </div>
                            
                            ${!isJetski ? `
                                <div class="form-group-modern">
                                    <label class="form-label-modern">
                                        <i class="fas fa-road"></i> Kilométrage
                                    </label>
                                    <input type="number" class="form-input-modern" name="mileage" value="${vehicle.mileage}" min="0">
                                </div>
                                
                                <div class="form-group-modern">
                                    <label class="form-label-modern">
                                        <i class="fas fa-cogs"></i> Transmission
                                    </label>
                                    <select class="form-select-modern" name="transmission">
                                        <option value="Manuel" ${vehicle.transmission === 'Manuel' ? 'selected' : ''}>Manuel</option>
                                        <option value="Automatique" ${vehicle.transmission === 'Automatique' ? 'selected' : ''}>Automatique</option>
                                    </select>
                                </div>
                            ` : `
                                <div class="form-group-modern">
                                    <label class="form-label-modern">
                                        <i class="fas fa-clock"></i> Heures d'utilisation
                                    </label>
                                    <input type="number" class="form-input-modern" name="hours" value="${vehicle.hours}" min="0">
                                </div>
                                
                                <div class="form-group-modern">
                                    <label class="form-label-modern">
                                        <i class="fas fa-cog"></i> Moteur
                                    </label>
                                    <input type="text" class="form-input-modern" name="engine" value="${vehicle.engine || ''}">
                                </div>
                                
                                <div class="form-group-modern">
                                    <label class="form-label-modern">
                                        <i class="fas fa-users"></i> Passagers
                                    </label>
                                    <input type="number" class="form-input-modern" name="passengers" value="${vehicle.passengers || ''}" min="1" max="10">
                                </div>
                            `}
                            
                            <div class="form-group-modern">
                                <label class="form-label-modern">
                                    <i class="fas fa-gas-pump"></i> Combustible
                                </label>
                                <select class="form-select-modern" name="fuel">
                                    <option value="Gasolina" ${vehicle.fuel === 'Gasolina' ? 'selected' : ''}>Gasolina</option>
                                    <option value="Diesel" ${vehicle.fuel === 'Diesel' ? 'selected' : ''}>Diesel</option>
                                    <option value="Híbrido" ${vehicle.fuel === 'Híbrido' ? 'selected' : ''}>Híbrido</option>
                                    <option value="Elétrico" ${vehicle.fuel === 'Elétrico' ? 'selected' : ''}>Elétrico</option>
                                </select>
                            </div>
                            
                            <div class="form-group-modern">
                                <label class="form-label-modern">
                                    <i class="fas fa-palette"></i> Couleur
                                </label>
                                <input type="text" class="form-input-modern" name="color" value="${vehicle.color || ''}">
                            </div>
                        </div>
                        
                        <div class="form-group-modern">
                            <label class="form-label-modern">
                                <i class="fas fa-align-left"></i> Description
                            </label>
                            <textarea class="form-textarea-modern" name="description" placeholder="Description détaillée du véhicule...">${vehicle.description || ''}</textarea>
                        </div>
                        
                        <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                            <button type="button" class="btn-modern btn-secondary-modern" onclick="this.closest('.modal-overlay').remove()">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                            <button type="submit" class="btn-modern btn-primary-modern">
                                <i class="fas fa-save"></i> Sauvegarder
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        return modal;
    }

    saveVehicleEdits(event, vehicleId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const vehicle = this.pendingVehicles.find(v => v.id === vehicleId);
        
        if (!vehicle) return;
        
        // Update vehicle data
        for (let [key, value] = formData.entries()) {
            vehicle[key] = value;
        }
        
        // Refresh display
        this.displayPendingVehicles();
        
        // Close modal
        event.target.closest('.modal-overlay').remove();
        
        this.showNotification('Modifications sauvegardées', 'success');
    }

    async publishVehicle(vehicleId) {
        const vehicle = this.pendingVehicles.find(v => v.id === vehicleId);
        const images = this.uploadedImages[vehicleId] || [];
        
        if (!vehicle || images.length === 0) {
            this.showNotification('Au moins une photo est requise pour publier', 'error');
            return;
        }
        
        try {
            // Prepare vehicle data for API
            const vehicleData = {
                ...vehicle,
                images: images.map(img => img.url), // In real app, upload to server first
                featured: false,
                status: 'available'
            };
            
            // Determine endpoint
            const isJetski = vehicle.hours !== undefined;
            const endpoint = isJetski ? 'jetskis' : 'cars';
            
            // Send to API
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(vehicleData)
            });
            
            if (response.ok) {
                // Remove from pending
                this.pendingVehicles = this.pendingVehicles.filter(v => v.id !== vehicleId);
                delete this.uploadedImages[vehicleId];
                
                // Refresh displays
                this.displayPendingVehicles();
                
                this.showNotification('Véhicule publié avec succès!', 'success');
                
                // Refresh main vehicle data
                if (window.app) {
                    await window.app.loadVehiclesData();
                }
            } else {
                throw new Error('Erreur lors de la publication');
            }
            
        } catch (error) {
            console.error('Publish error:', error);
            this.showNotification('Erreur lors de la publication', 'error');
        }
    }

    rejectVehicle(vehicleId) {
        if (!confirm('Êtes-vous sûr de vouloir rejeter ce véhicule ?')) return;
        
        // Remove from pending
        this.pendingVehicles = this.pendingVehicles.filter(v => v.id !== vehicleId);
        delete this.uploadedImages[vehicleId];
        
        this.displayPendingVehicles();
        this.showNotification('Véhicule rejeté', 'info');
    }

    // Vehicle Status Management
    async changeVehicleStatus(vehicleId, vehicleType, newStatus) {
        try {
            const endpoint = vehicleType === 'car' ? 'cars' : 'jetskis';
            const response = await fetch(`/api/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: `id=${vehicleId}&status=${newStatus}`
            });
            
            if (response.ok) {
                this.showNotification(`Statut changé vers ${newStatus}`, 'success');
                
                // Refresh vehicle data
                if (window.app) {
                    await window.app.loadVehiclesData();
                }
            } else {
                throw new Error('Erreur lors du changement de statut');
            }
        } catch (error) {
            console.error('Status change error:', error);
            this.showNotification('Erreur lors du changement de statut', 'error');
        }
    }

    // Enhanced Admin Tab Creation
    createEnhancedAdminTab(type) {
        const vehicles = type === 'cars' ? (window.app?.vehicles.cars || []) : (window.app?.vehicles.jetskis || []);
        const title = type === 'cars' ? 'Carros' : 'Jet-Skis';
        const icon = type === 'cars' ? 'car' : 'ship';
        
        return `
            <div class="admin-tab-content">
                ${type === 'cars' ? `
                    <div class="pending-vehicles">
                        <div class="pending-header">
                            <div class="pending-title">
                                <i class="fas fa-clock"></i> Véhicules en attente (${this.pendingVehicles.length})
                            </div>
                            <button class="sync-google-btn" onclick="app.admin.syncWithGoogleSheets()">
                                <i class="fab fa-google"></i> Synchroniser Google Sheets
                            </button>
                        </div>
                        <div id="pendingVehiclesContainer">
                            <!-- Populated by displayPendingVehicles() -->
                        </div>
                    </div>
                ` : ''}
                
                <div class="published-vehicles" style="margin-top: 30px;">
                    <h3 style="color: white; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-${icon}"></i> ${title} Publiés (${vehicles.length})
                    </h3>
                    
                    <div class="vehicle-management-grid">
                        ${vehicles.map(vehicle => this.createPublishedVehicleCard(vehicle, type)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createPublishedVehicleCard(vehicle, type) {
        const isJetski = type === 'jetskis';
        
        return `
            <div class="vehicle-management-card">
                <div class="vehicle-management-header">
                    <div class="vehicle-management-info">
                        <h4>${vehicle.brand} ${vehicle.model}</h4>
                        <div class="price">${this.formatPrice(vehicle.price)}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                            ${vehicle.year} • ${isJetski ? (vehicle.hours || 0) + 'h' : this.formatNumber(vehicle.mileage || 0) + ' KM'}
                        </div>
                    </div>
                    <div class="status-badge status-${vehicle.status || 'available'}">
                        ${this.getStatusText(vehicle.status || 'available')}
                    </div>
                </div>
                
                <div class="vehicle-images" style="margin: 15px 0;">
                    ${Array.isArray(vehicle.images) && vehicle.images.length > 0 ? `
                        <img src="${vehicle.images[0]}" alt="${vehicle.brand} ${vehicle.model}" 
                             style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                    ` : `
                        <div style="width: 100%; height: 120px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="font-size: 2rem; color: rgba(255,255,255,0.3);"></i>
                        </div>
                    `}
                </div>
                
                <div class="vehicle-management-actions">
                    <select onchange="app.admin.changeVehicleStatus(${vehicle.id}, '${type}', this.value)" 
                            style="padding: 8px; border-radius: 5px; margin-right: 10px;">
                        <option value="available" ${(vehicle.status || 'available') === 'available' ? 'selected' : ''}>Disponible</option>
                        <option value="reserved" ${vehicle.status === 'reserved' ? 'selected' : ''}>Réservé</option>
                        <option value="sold" ${vehicle.status === 'sold' ? 'selected' : ''}>Vendu</option>
                    </select>
                    
                    <button class="btn-modern btn-primary-modern" onclick="app.editVehicle(${vehicle.id}, '${type === 'cars' ? 'car' : 'jetski'}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-modern btn-danger-modern" onclick="app.deleteVehicle(${vehicle.id}, '${type === 'cars' ? 'car' : 'jetski'}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            'available': '<i class="fas fa-check"></i> Disponible',
            'reserved': '<i class="fas fa-bookmark"></i> Réservé',
            'sold': '<i class="fas fa-times"></i> Vendu',
            'pending': '<i class="fas fa-clock"></i> En attente'
        };
        return statusMap[status] || statusMap['available'];
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

    showSyncStatus(message, isLoading) {
        let indicator = document.querySelector('.sync-status');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'sync-status';
            document.body.appendChild(indicator);
        }

        indicator.innerHTML = `
            ${isLoading ? '<i class="fas fa-sync-alt sync-icon"></i>' : '<i class="fas fa-check"></i>'}
            <span class="sync-text">${message}</span>
        `;
        
        indicator.classList.add('visible');
        
        if (!isLoading) {
            setTimeout(() => {
                indicator.classList.remove('visible');
            }, 3000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 4000);
    }
}

// Initialize enhanced admin
if (typeof window !== 'undefined') {
    window.AdminEnhanced = AdminEnhanced;
}