class SkinEditor {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.skinUpload = document.getElementById('skinUpload');
        this.previewSection = document.getElementById('previewSection');
        this.originalCanvas = document.getElementById('originalCanvas');
        this.slicingCanvas = document.getElementById('slicingCanvas');
        this.slicedGrid = document.getElementById('slicedGrid');
        this.skinsGallery = document.getElementById('skinsGallery');
        
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.slicingCtx = this.slicingCanvas.getContext('2d');
        
        this.currentImage = null;
        this.slicedSegments = {};
        this.currentSkin = 'default';
        
        // Skin layout mapping (3x3 grid)
        this.skinLayout = {
            '0-0': { name: 'Body Turn', type: 'body_turn', required: true },
            '0-1': { name: 'Body Straight', type: 'body_straight', required: true },
            '0-2': { name: 'Head', type: 'head', required: true },
            '1-0': { name: 'Tail', type: 'tail', required: true },
            '1-1': { name: 'Empty', type: 'empty', required: false },
            '1-2': { name: 'Empty', type: 'empty', required: false },
            '2-0': { name: 'Apple/Food', type: 'food', required: true },
            '2-1': { name: 'Empty', type: 'empty', required: false },
            '2-2': { name: 'Dead Head', type: 'dead_head', required: true }
        };
        
        this.initEventListeners();
        this.loadAvailableSkins();
    }
    
    initEventListeners() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => {
            this.skinUpload.click();
        });
        
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
        
        this.skinUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
        
        // Button events
        document.getElementById('applySkinBtn').addEventListener('click', () => {
            this.applySkin();
        });
        
        document.getElementById('resetSkinBtn').addEventListener('click', () => {
            this.resetToDefault();
        });
        
        document.getElementById('downloadSlicesBtn').addEventListener('click', () => {
            this.downloadSlices();
        });
        
        document.getElementById('backToGameBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.processImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    processImage(img) {
        // Validate dimensions
        if (img.width !== 1080 || img.height !== 1080) {
            alert('Image must be exactly 1080×1080 pixels. Current size: ' + img.width + '×' + img.height);
            return;
        }
        
        this.currentImage = img;
        this.showPreview();
        this.sliceImage();
    }
    
    showPreview() {
        // Show original image
        this.originalCanvas.width = 300;
        this.originalCanvas.height = 300;
        this.originalCtx.drawImage(this.currentImage, 0, 0, 300, 300);
        
        this.previewSection.style.display = 'block';
    }
    
    sliceImage() {
        const segmentSize = 360; // 1080 / 3 = 360px per segment
        this.slicedSegments = {};
        this.slicedGrid.innerHTML = '';
        
        // Set up slicing canvas
        this.slicingCanvas.width = segmentSize;
        this.slicingCanvas.height = segmentSize;
        
        // Process each cell in the 3x3 grid
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const key = `${row}-${col}`;
                const layout = this.skinLayout[key];
                
                // Extract segment
                this.slicingCtx.clearRect(0, 0, segmentSize, segmentSize);
                this.slicingCtx.drawImage(
                    this.currentImage,
                    col * segmentSize, row * segmentSize, segmentSize, segmentSize,
                    0, 0, segmentSize, segmentSize
                );
                
                // Check if segment is empty
                const imageData = this.slicingCtx.getImageData(0, 0, segmentSize, segmentSize);
                const isEmpty = this.isImageEmpty(imageData);
                
                // Create segment data
                if (!isEmpty || layout.required) {
                    const dataURL = this.slicingCanvas.toDataURL('image/png');
                    this.slicedSegments[key] = {
                        dataURL: dataURL,
                        name: layout.name,
                        type: layout.type,
                        isEmpty: isEmpty
                    };
                }
                
                // Create preview element
                this.createSlicePreview(key, layout, isEmpty);
            }
        }
    }
    
    isImageEmpty(imageData) {
        const threshold = 10; // Allow for very slight variations
        let nonTransparentPixels = 0;
        
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > threshold) {
                nonTransparentPixels++;
            }
        }
        
        // Consider empty if less than 1% of pixels are non-transparent
        return nonTransparentPixels < (imageData.width * imageData.height * 0.01);
    }
    
    createSlicePreview(key, layout, isEmpty) {
        const sliceItem = document.createElement('div');
        sliceItem.className = 'slice-item';
        if (isEmpty && !layout.required) {
            sliceItem.classList.add('slice-empty');
        }
        
        const img = document.createElement('img');
        if (!isEmpty || layout.required) {
            img.src = this.slicedSegments[key].dataURL;
        } else {
            img.style.opacity = '0.3';
            img.alt = 'Empty';
        }
        
        const label = document.createElement('div');
        label.className = 'slice-label';
        label.textContent = layout.name;
        
        sliceItem.appendChild(img);
        sliceItem.appendChild(label);
        this.slicedGrid.appendChild(sliceItem);
    }
    
    applySkin() {
        // Generate unique skin ID
        const skinId = 'custom_' + Date.now();
        
        // Save skin data to localStorage
        const skinData = {
            id: skinId,
            name: 'Custom Skin',
            segments: this.slicedSegments,
            created: new Date().toISOString()
        };
        
        this.saveSkinToStorage(skinData);
        this.currentSkin = skinId;
        
        // Update gallery
        this.addSkinToGallery(skinData);
        
        // Apply to game (save as current skin)
        localStorage.setItem('currentSkin', skinId);
        
        alert('Skin applied successfully! Return to the game to see your custom skin.');
    }
    
    resetToDefault() {
        this.currentSkin = 'default';
        localStorage.setItem('currentSkin', 'default');
        this.updateGallerySelection();
        alert('Skin reset to default. Return to the game to see the changes.');
    }
    
    downloadSlices() {
        if (!this.slicedSegments || Object.keys(this.slicedSegments).length === 0) {
            alert('No slices to download. Please upload and process an image first.');
            return;
        }
        
        // Create a zip-like structure by downloading each slice
        Object.keys(this.slicedSegments).forEach(key => {
            const segment = this.slicedSegments[key];
            if (!segment.isEmpty) {
                const link = document.createElement('a');
                link.download = `${segment.type}_${key}.png`;
                link.href = segment.dataURL;
                link.click();
            }
        });
        
        alert('Slices downloaded! Check your downloads folder.');
    }
    
    saveSkinToStorage(skinData) {
        let savedSkins = JSON.parse(localStorage.getItem('customSkins') || '[]');
        
        // Remove existing skin with same ID
        savedSkins = savedSkins.filter(skin => skin.id !== skinData.id);
        
        // Add new skin
        savedSkins.push(skinData);
        
        // Limit to 10 custom skins to prevent storage bloat
        if (savedSkins.length > 10) {
            savedSkins = savedSkins.slice(-10);
        }
        
        localStorage.setItem('customSkins', JSON.stringify(savedSkins));
    }
    
    loadAvailableSkins() {
        // Clear gallery except default
        this.skinsGallery.innerHTML = `
            <div class="skin-item active" data-skin="default">
                <div class="skin-preview">
                    <img src="assets/snakes/greeny/head_up.png" alt="Default Skin">
                </div>
                <div class="skin-name">Default Green</div>
                <button class="select-skin-btn">Selected</button>
            </div>
        `;
        
        // Load custom skins from storage
        const savedSkins = JSON.parse(localStorage.getItem('customSkins') || '[]');
        savedSkins.forEach(skinData => {
            this.addSkinToGallery(skinData);
        });
        
        // Set current skin selection
        const currentSkin = localStorage.getItem('currentSkin') || 'default';
        this.currentSkin = currentSkin;
        this.updateGallerySelection();
    }
    
    addSkinToGallery(skinData) {
        const skinItem = document.createElement('div');
        skinItem.className = 'skin-item';
        skinItem.setAttribute('data-skin', skinData.id);
        
        // Use head image as preview
        const headSegment = skinData.segments['0-2']; // Head is at position 0-2
        const previewSrc = headSegment ? headSegment.dataURL : 'assets/snakes/greeny/head_up.png';
        
        skinItem.innerHTML = `
            <div class="skin-preview">
                <img src="${previewSrc}" alt="${skinData.name}">
            </div>
            <div class="skin-name">${skinData.name}</div>
            <button class="select-skin-btn">Select</button>
        `;
        
        // Add event listener
        skinItem.querySelector('.select-skin-btn').addEventListener('click', () => {
            this.selectSkin(skinData.id);
        });
        
        this.skinsGallery.appendChild(skinItem);
    }
    
    selectSkin(skinId) {
        this.currentSkin = skinId;
        localStorage.setItem('currentSkin', skinId);
        this.updateGallerySelection();
        
        if (skinId === 'default') {
            alert('Default skin selected. Return to the game to see the changes.');
        } else {
            alert('Custom skin selected. Return to the game to see the changes.');
        }
    }
    
    updateGallerySelection() {
        // Remove active class from all items
        this.skinsGallery.querySelectorAll('.skin-item').forEach(item => {
            item.classList.remove('active');
            const btn = item.querySelector('.select-skin-btn');
            btn.textContent = 'Select';
        });
        
        // Add active class to current skin
        const currentItem = this.skinsGallery.querySelector(`[data-skin="${this.currentSkin}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
            const btn = currentItem.querySelector('.select-skin-btn');
            btn.textContent = 'Selected';
        }
    }
}

// Initialize skin editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SkinEditor();
});