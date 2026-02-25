import { ControlPosition, IControl, Map as MapboxMap } from 'mapbox-gl';

/**
 * Defines a Mapbox style configuration
 */
export interface MapboxStyleDefinition {
    /** Display title for the style */
    title: string;
    /** Mapbox style URI */
    uri: string;
}

/**
 * Configuration options for the MapboxStyleSwitcherControl
 */
export interface MapboxStyleSwitcherOptions {
    /** Default style to be selected on initialization */
    defaultStyle?: string;
    /** Event listeners for style switcher interactions */
    eventListeners?: MapboxStyleSwitcherEvents;
}

/**
 * Event handlers for MapboxStyleSwitcherControl interactions
 * onOpen and onSelect return boolean - true to prevent default behavior.
 * onChange fires after the style has been changed.
 */
export interface MapboxStyleSwitcherEvents {
    /** Fired when the style selector is opened */
    onOpen?: (event: MouseEvent) => boolean;
    /** Fired when a style button is clicked */
    onSelect?: (event: MouseEvent) => boolean;
    /** Fired after the map style is changed */
    onChange?: (event: MouseEvent, style: string) => void;
}

/**
 * A Mapbox GL JS control that provides a style switcher interface.
 * Allows users to switch between different map styles with a dropdown-style interface.
 *
 * @example
 * ```typescript
 * import { MapboxStyleSwitcherControl } from '@deciosfernandes/mapbox-v3-gl-style-switcher';
 *
 * const map = new MapboxMap({ ... });
 * map.addControl(new MapboxStyleSwitcherControl());
 * ```
 */
export class MapboxStyleSwitcherControl implements IControl {
    /** Default style name when no custom default is provided */
    private static readonly DEFAULT_STYLE = 'Streets';

    /**
     * Default Mapbox style definitions
     * These are the standard Mapbox styles available by default
     */
    private static readonly DEFAULT_STYLES: ReadonlyArray<MapboxStyleDefinition> = [
        { title: 'Dark', uri: 'mapbox://styles/mapbox/dark-v11' },
        { title: 'Light', uri: 'mapbox://styles/mapbox/light-v11' },
        { title: 'Outdoors', uri: 'mapbox://styles/mapbox/outdoors-v12' },
        { title: 'Satellite', uri: 'mapbox://styles/mapbox/satellite-streets-v12' },
        { title: 'Streets', uri: 'mapbox://styles/mapbox/streets-v12' },
    ] as const;

    /** Main container element for the control */
    private controlContainer: HTMLElement | null = null;

    /** Event listeners configuration */
    private readonly events?: MapboxStyleSwitcherEvents;

    /** Reference to the Mapbox map instance */
    private map: MapboxMap | null = null;

    /** Container for the style selection dropdown */
    private mapStyleContainer: HTMLElement | null = null;

    /** Main toggle button for the style switcher */
    private styleButton: HTMLButtonElement | null = null;

    /** Array of available styles */
    private readonly styles: ReadonlyArray<MapboxStyleDefinition>;

    /** Name of the default style */
    private readonly defaultStyle: string;

    /**
     * Creates a new MapboxStyleSwitcherControl instance
     *
     * @param styles - Custom array of style definitions. If not provided, uses default Mapbox styles
     * @param options - Configuration options or default style name (for backward compatibility)
     *
     * @example
     * ```typescript
     * // Using default styles with custom default
     * const control = new MapboxStyleSwitcherControl(undefined, 'Dark');
     *
     * // Using custom styles with options
     * const customStyles = [
     *   { title: 'Custom Dark', uri: 'mapbox://styles/username/style-id' }
     * ];
     * const control = new MapboxStyleSwitcherControl(customStyles, {
     *   defaultStyle: 'Custom Dark',
     *   eventListeners: {
     *     onChange: (event, style) => console.log('Style changed to:', style)
     *   }
     * });
     * ```
     */
    constructor(styles?: MapboxStyleDefinition[], options?: MapboxStyleSwitcherOptions | string) {
        this.styles = styles || MapboxStyleSwitcherControl.DEFAULT_STYLES;

        // Handle backward compatibility - options can be a string (defaultStyle) or options object
        const defaultStyle = typeof options === 'string' ? options : options?.defaultStyle;
        this.defaultStyle = defaultStyle ?? MapboxStyleSwitcherControl.DEFAULT_STYLE;

        // Extract event listeners from options (only if options is not a string)
        this.events = typeof options !== 'string' ? options?.eventListeners : undefined; // Bind event handler to maintain proper 'this' context
        this.onDocumentClick = this.onDocumentClick.bind(this);

        // Validate that the default style exists in the provided styles
        this.validateDefaultStyle();
    }

    /**
     * Validates that the specified default style exists in the styles array
     * @private
     */
    private validateDefaultStyle(): void {
        const styleExists = this.styles.some((style) => style.title === this.defaultStyle);
        if (!styleExists) {
            console.warn(
                `MapboxStyleSwitcherControl: Default style "${this.defaultStyle}" not found in styles array. ` +
                    `Available styles: ${this.styles.map((s) => s.title).join(', ')}`,
            );
        }
    }

    /**
     * Returns the default position for this control on the map
     * Part of the IControl interface implementation
     *
     * @returns The default control position ('top-right')
     */
    public getDefaultPosition(): ControlPosition {
        return 'top-right';
    }

    /**
     * Called when the control is added to a map
     * Part of the IControl interface implementation
     *
     * @param map - The Mapbox map instance
     * @returns The HTML element representing this control
     * @throws Error if control initialization fails
     */
    public onAdd(map: MapboxMap): HTMLElement {
        if (!map) {
            throw new Error('MapboxStyleSwitcherControl: Map instance is required');
        }

        this.map = map;

        // Create main control container
        this.controlContainer = this.createControlContainer();

        // Create style selection dropdown container
        this.mapStyleContainer = this.createStyleContainer();

        // Create main toggle button
        this.styleButton = this.createStyleButton();

        // Create style selection buttons
        this.createStyleButtons();

        // Set up event listeners
        this.setupEventListeners();

        // Assemble the control
        this.controlContainer.appendChild(this.styleButton);
        this.controlContainer.appendChild(this.mapStyleContainer);

        return this.controlContainer;
    }

    /**
     * Creates the main control container element
     * @private
     */
    private createControlContainer(): HTMLElement {
        const container = document.createElement('div');
        container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group');
        return container;
    }

    /**
     * Creates the style selection dropdown container
     * @private
     */
    private createStyleContainer(): HTMLElement {
        const container = document.createElement('div');
        container.classList.add('mapboxgl-style-list');
        container.setAttribute('role', 'menu');
        return container;
    }

    /**
     * Creates the main toggle button
     * @private
     */
    private createStyleButton(): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('mapboxgl-ctrl-icon', 'mapboxgl-style-switcher');
        button.setAttribute('aria-label', 'Switch map style');
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        return button;
    }

    /**
     * Creates individual style selection buttons
     * @private
     */
    private createStyleButtons(): void {
        if (!this.mapStyleContainer) {
            throw new Error('Style container not initialized');
        }
        for (const style of this.styles) {
            try {
                const styleButton = this.createIndividualStyleButton(style);
                this.mapStyleContainer.appendChild(styleButton);
            } catch (error) {
                console.error(`Failed to create style button for "${style.title}":`, error);
            }
        }
    }

    /**
     * Creates an individual style selection button
     * @private
     */
    private createIndividualStyleButton(style: MapboxStyleDefinition): HTMLButtonElement {
        const styleButton = document.createElement('button');
        styleButton.type = 'button';
        styleButton.setAttribute('role', 'menuitem');
        styleButton.textContent = style.title;

        // Create CSS-safe class name from title
        const safeClassName = style.title.replace(/[^a-z0-9-]/gi, '_');
        styleButton.classList.add(safeClassName);

        // Store style URI in dataset
        styleButton.dataset.uri = style.uri;

        // Set up click event handler
        styleButton.addEventListener('click', (event) => {
            this.handleStyleButtonClick(event, style);
        });

        // Mark as active if this is the default style
        if (style.title === this.defaultStyle) {
            styleButton.classList.add('active');
        }

        return styleButton;
    }

    /**
     * Handles click events on style selection buttons
     * @private
     */
    private handleStyleButtonClick(event: MouseEvent, style: MapboxStyleDefinition): void {
        const target = event.target as HTMLButtonElement;

        // Close the dropdown
        this.closeModal();

        // Don't do anything if this style is already active
        if (target.classList.contains('active')) {
            return;
        }

        // Call onSelect event handler if provided
        if (this.events?.onSelect?.(event)) {
            return; // Event handler returned true, stop processing
        }

        try {
            // Change the map style
            if (!this.map) {
                throw new Error('Map instance not available');
            }

            this.map.setStyle(style.uri);

            // Update active state
            this.updateActiveStyleButton(target);

            // Call onChange event handler if provided
            this.events?.onChange?.(event, style.uri);
        } catch (error) {
            console.error('Failed to change map style:', error);
        }
    }

    /**
     * Updates the active state of style buttons
     * @private
     */
    private updateActiveStyleButton(newActiveButton: HTMLButtonElement): void {
        if (!this.mapStyleContainer) {
            return;
        }

        // Remove active class from all buttons
        const activeButtons = this.mapStyleContainer.querySelectorAll('.active');
        activeButtons.forEach((button) => button.classList.remove('active'));

        // Add active class to the new button
        newActiveButton.classList.add('active');
    }

    /**
     * Sets up event listeners for the control
     * @private
     */
    private setupEventListeners(): void {
        if (!this.styleButton) {
            throw new Error('Style button not initialized');
        }

        // Handle main button click (opens/closes dropdown)
        this.styleButton.addEventListener('click', (event) => {
            // Call onOpen event handler if provided
            if (this.events?.onOpen?.(event)) {
                return; // Event handler returned true, stop processing
            }
            this.openModal();
        });

        // Handle clicks outside the control (closes dropdown)
        document.addEventListener('click', this.onDocumentClick);

        // Set up keyboard navigation within the dropdown
        this.setupKeyboardNavigation();
    }

    /**
     * Sets up keyboard navigation for the style dropdown.
     * ArrowDown/ArrowUp move focus between options; Escape closes the dropdown.
     * @private
     */
    private setupKeyboardNavigation(): void {
        if (!this.mapStyleContainer) {
            return;
        }

        this.mapStyleContainer.addEventListener('keydown', (event: KeyboardEvent) => {
            const buttons = Array.from(this.mapStyleContainer!.querySelectorAll<HTMLButtonElement>('button'));
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

    /**
     * Called when the control is removed from a map
     * Part of the IControl interface implementation
     * Cleans up event listeners and DOM elements
     */
    public onRemove(): void {
        // Remove document event listener
        document.removeEventListener('click', this.onDocumentClick);

        // Remove control from DOM if it exists
        if (this.controlContainer?.parentNode) {
            this.controlContainer.parentNode.removeChild(this.controlContainer);
        }

        // Clean up references
        this.map = null;
        this.controlContainer = null;
        this.mapStyleContainer = null;
        this.styleButton = null;
    }

    /**
     * Closes the style selection dropdown
     * @private
     */
    private closeModal(): void {
        if (this.mapStyleContainer && this.styleButton) {
            this.mapStyleContainer.style.display = 'none';
            this.styleButton.style.display = 'block';
            this.styleButton.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Opens the style selection dropdown
     * @private
     */
    private openModal(): void {
        if (this.mapStyleContainer && this.styleButton) {
            this.mapStyleContainer.style.display = 'block';
            this.styleButton.style.display = 'none';
            this.styleButton.setAttribute('aria-expanded', 'true');

            // Focus the active style button, or the first button if none is active
            const activeButton = this.mapStyleContainer.querySelector<HTMLButtonElement>('button.active');
            const firstButton = this.mapStyleContainer.querySelector<HTMLButtonElement>('button');
            (activeButton ?? firstButton)?.focus();
        }
    }

    /**
     * Handles clicks outside the control to close the dropdown
     * @private
     */
    private onDocumentClick(event: MouseEvent): void {
        const target = event.target as Element;

        // Close modal if click is outside the control container
        if (this.controlContainer && !this.controlContainer.contains(target)) {
            this.closeModal();
        }
    }

    /**
     * Gets the currently active style
     * @returns The currently active style definition, or null if none is active
     */
    public getCurrentStyle(): MapboxStyleDefinition | null {
        if (!this.mapStyleContainer) {
            return null;
        }

        const activeButton = this.mapStyleContainer.querySelector('.active') as HTMLButtonElement;
        if (!activeButton || !activeButton.dataset.uri) {
            return null;
        }

        const uri = activeButton.dataset.uri;
        if (!uri) {
            return null;
        }
        return this.styles.find((style) => style.uri === uri) || null;
    }

    /**
     * Programmatically sets the active style
     * @param styleName - The name/title of the style to activate
     * @returns True if the style was successfully set, false otherwise
     */
    public setStyle(styleName: string): boolean {
        const targetStyle = this.styles.find((style) => style.title === styleName);
        if (!targetStyle || !this.map) {
            return false;
        }

        try {
            this.map.setStyle(targetStyle.uri);

            // Update UI to reflect the change
            if (this.mapStyleContainer) {
                const targetButton = Array.from(this.mapStyleContainer.querySelectorAll<HTMLButtonElement>('button')).find(
                    (btn) => btn.dataset.uri === targetStyle.uri,
                );

                if (targetButton) {
                    this.updateActiveStyleButton(targetButton);
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to set style programmatically:', error);
            return false;
        }
    }

    /**
     * Gets all available style definitions
     * @returns Read-only array of all available styles
     */
    public getStyles(): ReadonlyArray<MapboxStyleDefinition> {
        return this.styles;
    }
}
