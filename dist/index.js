export class MapboxStyleSwitcherControl {
    constructor(styles, options) {
        this.controlContainer = null;
        this.map = null;
        this.mapStyleContainer = null;
        this.styleButton = null;
        this.styles = styles || MapboxStyleSwitcherControl.DEFAULT_STYLES;
        const defaultStyle = typeof options === 'string' ? options : options?.defaultStyle;
        this.defaultStyle = defaultStyle ?? MapboxStyleSwitcherControl.DEFAULT_STYLE;
        this.events = typeof options !== 'string' ? options?.eventListeners : undefined;
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.validateDefaultStyle();
    }
    validateDefaultStyle() {
        const styleExists = this.styles.some((style) => style.title === this.defaultStyle);
        if (!styleExists) {
            console.warn(`MapboxStyleSwitcherControl: Default style "${this.defaultStyle}" not found in styles array. ` +
                `Available styles: ${this.styles.map((s) => s.title).join(', ')}`);
        }
    }
    getDefaultPosition() {
        return 'top-right';
    }
    onAdd(map) {
        if (!map) {
            throw new Error('MapboxStyleSwitcherControl: Map instance is required');
        }
        this.map = map;
        this.controlContainer = this.createControlContainer();
        this.mapStyleContainer = this.createStyleContainer();
        this.styleButton = this.createStyleButton();
        this.createStyleButtons();
        this.setupEventListeners();
        this.controlContainer.appendChild(this.styleButton);
        this.controlContainer.appendChild(this.mapStyleContainer);
        return this.controlContainer;
    }
    createControlContainer() {
        const container = document.createElement('div');
        container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group');
        return container;
    }
    createStyleContainer() {
        const container = document.createElement('div');
        container.classList.add('mapboxgl-style-list');
        container.setAttribute('role', 'menu');
        return container;
    }
    createStyleButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('mapboxgl-ctrl-icon', 'mapboxgl-style-switcher');
        button.setAttribute('aria-label', 'Switch map style');
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        return button;
    }
    createStyleButtons() {
        if (!this.mapStyleContainer) {
            throw new Error('Style container not initialized');
        }
        for (const style of this.styles) {
            try {
                const styleButton = this.createIndividualStyleButton(style);
                this.mapStyleContainer.appendChild(styleButton);
            }
            catch (error) {
                console.error(`Failed to create style button for "${style.title}":`, error);
            }
        }
    }
    createIndividualStyleButton(style) {
        const styleButton = document.createElement('button');
        styleButton.type = 'button';
        styleButton.setAttribute('role', 'menuitem');
        styleButton.textContent = style.title;
        const safeClassName = style.title.replace(/[^a-z0-9-]/gi, '_');
        styleButton.classList.add(safeClassName);
        styleButton.dataset.uri = style.uri;
        styleButton.addEventListener('click', (event) => {
            this.handleStyleButtonClick(event, style);
        });
        if (style.title === this.defaultStyle) {
            styleButton.classList.add('active');
        }
        return styleButton;
    }
    handleStyleButtonClick(event, style) {
        const target = event.target;
        this.closeModal();
        if (target.classList.contains('active')) {
            return;
        }
        if (this.events?.onSelect?.(event)) {
            return;
        }
        try {
            if (!this.map) {
                throw new Error('Map instance not available');
            }
            this.map.setStyle(style.uri);
            this.updateActiveStyleButton(target);
            this.events?.onChange?.(event, style.uri);
        }
        catch (error) {
            console.error('Failed to change map style:', error);
        }
    }
    updateActiveStyleButton(newActiveButton) {
        if (!this.mapStyleContainer) {
            return;
        }
        const activeButtons = this.mapStyleContainer.querySelectorAll('.active');
        activeButtons.forEach((button) => button.classList.remove('active'));
        newActiveButton.classList.add('active');
    }
    setupEventListeners() {
        if (!this.styleButton) {
            throw new Error('Style button not initialized');
        }
        this.styleButton.addEventListener('click', (event) => {
            if (this.events?.onOpen?.(event)) {
                return;
            }
            this.openModal();
        });
        document.addEventListener('click', this.onDocumentClick);
        this.setupKeyboardNavigation();
    }
    setupKeyboardNavigation() {
        if (!this.mapStyleContainer) {
            return;
        }
        this.mapStyleContainer.addEventListener('keydown', (event) => {
            const buttons = Array.from(this.mapStyleContainer.querySelectorAll('button'));
            const focusedIndex = buttons.findIndex((btn) => btn === document.activeElement);
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    buttons[(focusedIndex + 1) % buttons.length]?.focus();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    buttons[(focusedIndex - 1 + buttons.length) % buttons.length]?.focus();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.closeModal();
                    this.styleButton?.focus();
                    break;
            }
        });
    }
    onRemove() {
        document.removeEventListener('click', this.onDocumentClick);
        if (this.controlContainer?.parentNode) {
            this.controlContainer.parentNode.removeChild(this.controlContainer);
        }
        this.map = null;
        this.controlContainer = null;
        this.mapStyleContainer = null;
        this.styleButton = null;
    }
    closeModal() {
        if (this.mapStyleContainer && this.styleButton) {
            this.mapStyleContainer.style.display = 'none';
            this.styleButton.style.display = 'block';
            this.styleButton.setAttribute('aria-expanded', 'false');
        }
    }
    openModal() {
        if (this.mapStyleContainer && this.styleButton) {
            this.mapStyleContainer.style.display = 'block';
            this.styleButton.style.display = 'none';
            this.styleButton.setAttribute('aria-expanded', 'true');
            const activeButton = this.mapStyleContainer.querySelector('button.active');
            const firstButton = this.mapStyleContainer.querySelector('button');
            (activeButton ?? firstButton)?.focus();
        }
    }
    onDocumentClick(event) {
        const target = event.target;
        if (this.controlContainer && !this.controlContainer.contains(target)) {
            this.closeModal();
        }
    }
    getCurrentStyle() {
        if (!this.mapStyleContainer) {
            return null;
        }
        const activeButton = this.mapStyleContainer.querySelector('.active');
        if (!activeButton || !activeButton.dataset.uri) {
            return null;
        }
        const uri = activeButton.dataset.uri;
        if (!uri) {
            return null;
        }
        return this.styles.find((style) => style.uri === uri) || null;
    }
    setStyle(styleName) {
        const targetStyle = this.styles.find((style) => style.title === styleName);
        if (!targetStyle || !this.map) {
            return false;
        }
        try {
            this.map.setStyle(targetStyle.uri);
            if (this.mapStyleContainer) {
                const targetButton = Array.from(this.mapStyleContainer.querySelectorAll('button')).find((btn) => btn.dataset.uri === targetStyle.uri);
                if (targetButton) {
                    this.updateActiveStyleButton(targetButton);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Failed to set style programmatically:', error);
            return false;
        }
    }
    getStyles() {
        return this.styles;
    }
}
MapboxStyleSwitcherControl.DEFAULT_STYLE = 'Streets';
MapboxStyleSwitcherControl.DEFAULT_STYLES = [
    { title: 'Dark', uri: 'mapbox://styles/mapbox/dark-v11' },
    { title: 'Light', uri: 'mapbox://styles/mapbox/light-v11' },
    { title: 'Outdoors', uri: 'mapbox://styles/mapbox/outdoors-v12' },
    { title: 'Satellite', uri: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { title: 'Streets', uri: 'mapbox://styles/mapbox/streets-v12' },
];
