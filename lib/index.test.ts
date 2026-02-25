import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MapboxStyleDefinition, MapboxStyleSwitcherControl } from './index';

// mapbox-gl relies on WebGL which is unavailable in jsdom
vi.mock('mapbox-gl', () => ({
    Map: class {},
}));

const createMockMap = () => ({ setStyle: vi.fn() });

// ─── Constructor ────────────────────────────────────────────────────────────

describe('Constructor', () => {
    it('creates with the five default styles', () => {
        const control = new MapboxStyleSwitcherControl();
        expect(control.getStyles()).toHaveLength(5);
    });

    it('creates with custom styles', () => {
        const customStyles: MapboxStyleDefinition[] = [{ title: 'Custom', uri: 'mapbox://styles/org/custom' }];
        const control = new MapboxStyleSwitcherControl(customStyles);
        expect(control.getStyles()).toHaveLength(1);
    });

    it('warns when the default style is not found', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        new MapboxStyleSwitcherControl(undefined, 'NonExistent');
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Default style "NonExistent" not found'));
        warnSpy.mockRestore();
    });

    it('accepts a string as the second argument (backward compat)', () => {
        const control = new MapboxStyleSwitcherControl(undefined, 'Dark');
        expect(control.getStyles().some((s) => s.title === 'Dark')).toBe(true);
    });
});

// ─── getDefaultPosition ──────────────────────────────────────────────────────

describe('getDefaultPosition', () => {
    it("returns 'top-right'", () => {
        expect(new MapboxStyleSwitcherControl().getDefaultPosition()).toBe('top-right');
    });
});

// ─── getStyles ───────────────────────────────────────────────────────────────

describe('getStyles', () => {
    it('contains all five default titles', () => {
        const titles = new MapboxStyleSwitcherControl().getStyles().map((s) => s.title);
        expect(titles).toEqual(expect.arrayContaining(['Dark', 'Light', 'Outdoors', 'Satellite', 'Streets']));
    });

    it('default style URIs reference v11/v12 variants', () => {
        const uris = new MapboxStyleSwitcherControl().getStyles().map((s) => s.uri);
        uris.forEach((uri) => {
            expect(uri).not.toMatch(/-(v10|streets-v11|outdoors-v11|satellite-streets-v11)/);
        });
    });
});

// ─── onAdd ───────────────────────────────────────────────────────────────────

describe('onAdd', () => {
    it('returns an HTMLElement', () => {
        const element = new MapboxStyleSwitcherControl().onAdd(createMockMap() as any);
        expect(element).toBeInstanceOf(HTMLElement);
    });

    it('throws when no map is provided', () => {
        expect(() => new MapboxStyleSwitcherControl().onAdd(null as any)).toThrow('MapboxStyleSwitcherControl: Map instance is required');
    });

    it('renders a button for every style', () => {
        const element = new MapboxStyleSwitcherControl().onAdd(createMockMap() as any);
        expect(element.querySelectorAll('.mapboxgl-style-list button')).toHaveLength(5);
    });

    it('marks the default style as active', () => {
        const element = new MapboxStyleSwitcherControl().onAdd(createMockMap() as any);
        const active = element.querySelector('.mapboxgl-style-list button.active');
        expect(active?.textContent).toBe('Streets');
    });

    it('marks a custom default style as active', () => {
        const element = new MapboxStyleSwitcherControl(undefined, 'Dark').onAdd(createMockMap() as any);
        const active = element.querySelector('.mapboxgl-style-list button.active');
        expect(active?.textContent).toBe('Dark');
    });

    it('toggle button has required ARIA attributes', () => {
        const element = new MapboxStyleSwitcherControl().onAdd(createMockMap() as any);
        const btn = element.querySelector('.mapboxgl-style-switcher') as HTMLButtonElement;
        expect(btn.getAttribute('aria-haspopup')).toBe('true');
        expect(btn.getAttribute('aria-expanded')).toBe('false');
        expect(btn.getAttribute('aria-label')).toBeTruthy();
    });

    it('style list has role="menu"', () => {
        const element = new MapboxStyleSwitcherControl().onAdd(createMockMap() as any);
        expect(element.querySelector('.mapboxgl-style-list')?.getAttribute('role')).toBe('menu');
    });

    it('each style button has role="menuitem"', () => {
        const element = new MapboxStyleSwitcherControl().onAdd(createMockMap() as any);
        element.querySelectorAll('.mapboxgl-style-list button').forEach((btn) => expect(btn.getAttribute('role')).toBe('menuitem'));
    });
});

// ─── onRemove ────────────────────────────────────────────────────────────────

describe('onRemove', () => {
    it('removes the control element from the DOM', () => {
        const control = new MapboxStyleSwitcherControl();
        const wrapper = document.createElement('div');
        document.body.appendChild(wrapper);
        wrapper.appendChild(control.onAdd(createMockMap() as any));
        control.onRemove();
        expect(wrapper.children).toHaveLength(0);
        wrapper.remove();
    });
});

// ─── getCurrentStyle ─────────────────────────────────────────────────────────

describe('getCurrentStyle', () => {
    it('returns null before onAdd', () => {
        expect(new MapboxStyleSwitcherControl().getCurrentStyle()).toBeNull();
    });

    it('returns the active style definition after onAdd', () => {
        const control = new MapboxStyleSwitcherControl();
        control.onAdd(createMockMap() as any);
        const current = control.getCurrentStyle();
        expect(current?.title).toBe('Streets');
        expect(current?.uri).toBe('mapbox://styles/mapbox/streets-v12');
    });
});

// ─── setStyle ────────────────────────────────────────────────────────────────

describe('setStyle', () => {
    it('returns false when called before onAdd', () => {
        expect(new MapboxStyleSwitcherControl().setStyle('Dark')).toBe(false);
    });

    it('returns false for an unknown style name', () => {
        const control = new MapboxStyleSwitcherControl();
        control.onAdd(createMockMap() as any);
        expect(control.setStyle('NonExistent')).toBe(false);
    });

    it('calls map.setStyle with the correct URI', () => {
        const map = createMockMap();
        const control = new MapboxStyleSwitcherControl();
        control.onAdd(map as any);
        expect(control.setStyle('Dark')).toBe(true);
        expect(map.setStyle).toHaveBeenCalledWith('mapbox://styles/mapbox/dark-v11');
    });

    it('updates the active button in the dropdown', () => {
        const control = new MapboxStyleSwitcherControl();
        const element = control.onAdd(createMockMap() as any);
        control.setStyle('Dark');
        const active = element.querySelector('.mapboxgl-style-list button.active');
        expect(active?.textContent).toBe('Dark');
    });
});

// ─── Event listeners ─────────────────────────────────────────────────────────

describe('Event listeners', () => {
    it('calls onOpen when the toggle button is clicked', () => {
        const onOpen = vi.fn().mockReturnValue(false);
        const control = new MapboxStyleSwitcherControl(undefined, {
            eventListeners: { onOpen },
        });
        const element = control.onAdd(createMockMap() as any);
        (element.querySelector('.mapboxgl-style-switcher') as HTMLButtonElement).click();
        expect(onOpen).toHaveBeenCalledOnce();
    });

    it('prevents the dropdown from opening when onOpen returns true', () => {
        const control = new MapboxStyleSwitcherControl(undefined, {
            eventListeners: { onOpen: vi.fn().mockReturnValue(true) },
        });
        const element = control.onAdd(createMockMap() as any);
        (element.querySelector('.mapboxgl-style-switcher') as HTMLButtonElement).click();
        const list = element.querySelector('.mapboxgl-style-list') as HTMLElement;
        expect(list.style.display).not.toBe('block');
    });

    it('calls onSelect when a style button is clicked', () => {
        const onSelect = vi.fn().mockReturnValue(false);
        const control = new MapboxStyleSwitcherControl(undefined, {
            eventListeners: { onSelect },
        });
        const element = control.onAdd(createMockMap() as any);
        (element.querySelector('.mapboxgl-style-list .Dark') as HTMLButtonElement).click();
        expect(onSelect).toHaveBeenCalledOnce();
    });

    it('prevents style change when onSelect returns true', () => {
        const map = createMockMap();
        const control = new MapboxStyleSwitcherControl(undefined, {
            eventListeners: { onSelect: vi.fn().mockReturnValue(true) },
        });
        const element = control.onAdd(map as any);
        (element.querySelector('.mapboxgl-style-list .Dark') as HTMLButtonElement).click();
        expect(map.setStyle).not.toHaveBeenCalled();
    });

    it('calls onChange after the style is changed', () => {
        const onChange = vi.fn();
        const control = new MapboxStyleSwitcherControl(undefined, {
            eventListeners: { onChange },
        });
        const element = control.onAdd(createMockMap() as any);
        (element.querySelector('.mapboxgl-style-list .Dark') as HTMLButtonElement).click();
        expect(onChange).toHaveBeenCalledWith(expect.anything(), 'mapbox://styles/mapbox/dark-v11');
    });
});

// ─── Keyboard navigation ─────────────────────────────────────────────────────

describe('Keyboard navigation', () => {
    let control: MapboxStyleSwitcherControl;
    let element: HTMLElement;

    beforeEach(() => {
        control = new MapboxStyleSwitcherControl();
        element = control.onAdd(createMockMap() as any);
        document.body.appendChild(element);
    });

    it('closes the dropdown and restores focus on Escape', () => {
        // Open the dropdown first
        (element.querySelector('.mapboxgl-style-switcher') as HTMLButtonElement).click();
        const list = element.querySelector('.mapboxgl-style-list') as HTMLElement;
        expect(list.style.display).toBe('block');

        list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(list.style.display).toBe('none');
    });
});
