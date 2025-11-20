# Mapbox GL JS Style Switcher

A modern, fully-typed TypeScript control for Mapbox GL JS that provides an intuitive dropdown-style interface for switching between map styles.

[![Bundle Size](https://img.shields.io/bundlephobia/min/@deciosfernandes/mapbox-v3-gl-style-switcher)](https://bundlephobia.com/package/@deciosfernandes/mapbox-v3-gl-style-switcher)
[![npm version](https://img.shields.io/npm/v/@deciosfernandes/mapbox-v3-gl-style-switcher)](https://www.npmjs.com/package/@deciosfernandes/mapbox-v3-gl-style-switcher)
[![TypeScript](https://img.shields.io/npm/types/@deciosfernandes/mapbox-v3-gl-style-switcher)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@deciosfernandes/mapbox-v3-gl-style-switcher)](https://github.com/deciosfernandes/style-switcher/blob/master/LICENSE)

## ✨ Features

-   🎨 **Pre-configured styles** - Comes with 5 popular Mapbox styles out of the box
-   🔧 **Fully customizable** - Use your own styles and configurations
-   🎯 **TypeScript first** - Built with modern TypeScript, full type safety
-   📱 **Responsive design** - Works seamlessly on desktop and mobile
-   🎪 **Event-driven** - Rich event system for custom interactions
-   🚀 **Modern syntax** - Leverages optional chaining and nullish coalescing
-   🛡️ **Error resilient** - Robust error handling and validation
-   📦 **Zero dependencies** - Only requires Mapbox GL JS

## 🚀 Installation

```bash
npm i @deciosfernandes/mapbox-v3-gl-style-switcher --save
```

```bash
yarn add @deciosfernandes/mapbox-v3-gl-style-switcher
```

```bash
pnpm add @deciosfernandes/mapbox-v3-gl-style-switcher
```

## 📋 Requirements

-   **Mapbox GL JS** v3.x
-   **TypeScript** 5.0+ (for TypeScript projects)
-   **Node.js** 16+ (for development)

## 🎯 Quick Start

```typescript
import { MapboxStyleSwitcherControl } from '@deciosfernandes/mapbox-v3-gl-style-switcher';
import { Map as MapboxMap } from 'mapbox-gl';

// Import the CSS styles
import 'mapbox-v3-gl-style-switcher/styles.css';

// Create your map
const map = new MapboxMap({
    container: 'map',
    accessToken: 'your-mapbox-token',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-74.5, 40],
    zoom: 9,
});

// Add the style switcher control
map.addControl(new MapboxStyleSwitcherControl());
```

## 🎨 Default Styles

The control includes these pre-configured Mapbox styles:

| Style Name    | Description                    | URI                                            |
| ------------- | ------------------------------ | ---------------------------------------------- |
| **Streets**   | Standard street map (default)  | `mapbox://styles/mapbox/streets-v11`           |
| **Light**     | Clean, minimal light theme     | `mapbox://styles/mapbox/light-v10`             |
| **Dark**      | Elegant dark theme             | `mapbox://styles/mapbox/dark-v10`              |
| **Outdoors**  | Perfect for outdoor activities | `mapbox://styles/mapbox/outdoors-v11`          |
| **Satellite** | Satellite imagery with streets | `mapbox://styles/mapbox/satellite-streets-v11` |

## 🔧 Configuration

### Custom Styles

```typescript
import { MapboxStyleDefinition, MapboxStyleSwitcherControl } from '@deciosfernandes/mapbox-v3-gl-style-switcher';

const customStyles: MapboxStyleDefinition[] = [
    {
        title: 'Custom Dark',
        uri: 'mapbox://styles/your-username/your-dark-style-id',
    },
    {
        title: 'Custom Light',
        uri: 'mapbox://styles/your-username/your-light-style-id',
    },
    {
        title: 'Vintage',
        uri: 'mapbox://styles/your-username/vintage-style-id',
    },
];

map.addControl(new MapboxStyleSwitcherControl(customStyles));
```

### Advanced Configuration

```typescript
import { MapboxStyleSwitcherOptions } from '@deciosfernandes/mapbox-v3-gl-style-switcher';

const options: MapboxStyleSwitcherOptions = {
    defaultStyle: 'Custom Dark',
    eventListeners: {
        onOpen: (event) => {
            console.log('Style selector opened');
            // Return true to prevent default behavior
            return false;
        },
        onSelect: (event) => {
            console.log('Style button clicked');
            return false;
        },
        onChange: (event, styleUri) => {
            console.log(`Map style changed to: ${styleUri}`);
            // Analytics tracking example
            analytics.track('style_changed', { style: styleUri });
            return false;
        },
    },
};

map.addControl(new MapboxStyleSwitcherControl(customStyles, options));
```

### Backward Compatible Syntax

```typescript
// Simple string-based default style (legacy support)
map.addControl(new MapboxStyleSwitcherControl(customStyles, 'Dark'));
```

## 📖 API Reference

### `MapboxStyleSwitcherControl`

#### Constructor

```typescript
constructor(
    styles?: MapboxStyleDefinition[],
    options?: MapboxStyleSwitcherOptions | string
)
```

**Parameters:**

-   `styles` - Optional array of custom style definitions. Defaults to built-in Mapbox styles
-   `options` - Configuration options object, or string for backward compatibility (default style name)

#### Public Methods

##### `getCurrentStyle(): MapboxStyleDefinition | null`

Returns the currently active style definition.

```typescript
const control = new MapboxStyleSwitcherControl();
map.addControl(control);

// Later in your code
const currentStyle = control.getCurrentStyle();
console.log(`Current style: ${currentStyle?.title}`);
```

##### `setStyle(styleName: string): boolean`

Programmatically changes the map style.

```typescript
const success = control.setStyle('Dark');
if (success) {
    console.log('Style changed successfully');
} else {
    console.log('Style not found or change failed');
}
```

##### `getStyles(): ReadonlyArray<MapboxStyleDefinition>`

Returns all available style definitions.

```typescript
const availableStyles = control.getStyles();
console.log(
    'Available styles:',
    availableStyles.map((s) => s.title)
);
```

##### `getDefaultPosition(): ControlPosition`

Returns the default control position ('top-right').

### Interfaces

#### `MapboxStyleDefinition`

```typescript
interface MapboxStyleDefinition {
    /** Display title for the style */
    title: string;
    /** Mapbox style URI */
    uri: string;
}
```

#### `MapboxStyleSwitcherOptions`

```typescript
interface MapboxStyleSwitcherOptions {
    /** Default style to be selected on initialization */
    defaultStyle?: string;
    /** Event listeners for style switcher interactions */
    eventListeners?: MapboxStyleSwitcherEvents;
}
```

#### `MapboxStyleSwitcherEvents`

```typescript
interface MapboxStyleSwitcherEvents {
    /** Fired when the style selector is opened */
    onOpen?: (event: MouseEvent) => boolean;
    /** Fired when a style button is clicked */
    onSelect?: (event: MouseEvent) => boolean;
    /** Fired when the map style is changed */
    onChange?: (event: MouseEvent, style: string) => boolean;
}
```

**Event Handler Return Values:**

-   Return `true` to prevent the default behavior
-   Return `false` or `undefined` to allow normal processing

## 💡 Advanced Examples

### Dynamic Style Management

```typescript
class MapManager {
    private map: MapboxMap;
    private styleControl: MapboxStyleSwitcherControl;

    constructor() {
        this.map = new MapboxMap({
            /* config */
        });
        this.styleControl = new MapboxStyleSwitcherControl(this.getCustomStyles(), {
            defaultStyle: 'Corporate',
            eventListeners: {
                onChange: this.handleStyleChange.bind(this),
            },
        });

        this.map.addControl(this.styleControl);
    }

    private getCustomStyles(): MapboxStyleDefinition[] {
        return [
            { title: 'Corporate', uri: 'mapbox://styles/company/corporate' },
            { title: 'Presentation', uri: 'mapbox://styles/company/presentation' },
            { title: 'Analysis', uri: 'mapbox://styles/company/analysis' },
        ];
    }

    private handleStyleChange(event: MouseEvent, styleUri: string): boolean {
        // Custom logic when style changes
        this.updateUI(styleUri);
        this.saveUserPreference(styleUri);
        return false;
    }

    public switchToAnalysisMode(): void {
        this.styleControl.setStyle('Analysis');
    }
}
```

### Integration with UI Frameworks

#### React Example

```tsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapboxStyleSwitcherControl } from '@deciosfernandes/mapbox-v3-gl-style-switcher';

const MapComponent: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-74.5, 40],
            zoom: 9,
        });

        const styleControl = new MapboxStyleSwitcherControl(undefined, {
            defaultStyle: 'Streets',
            eventListeners: {
                onChange: (event, style) => {
                    console.log('React: Style changed to', style);
                    return false;
                },
            },
        });

        map.current.addControl(styleControl);

        return () => {
            map.current?.remove();
        };
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{ width: '100%', height: '400px' }}
        />
    );
};

export default MapComponent;
```

#### Vue Example

```vue
<template>
    <div
        ref="mapContainer"
        class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import mapboxgl from 'mapbox-gl';
import { MapboxStyleSwitcherControl } from '@deciosfernandes/mapbox-v3-gl-style-switcher';

const mapContainer = ref<HTMLDivElement>();
let map: mapboxgl.Map | null = null;

onMounted(() => {
    if (!mapContainer.value) return;

    map = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 9,
    });

    const styleControl = new MapboxStyleSwitcherControl();
    map.addControl(styleControl);
});

onUnmounted(() => {
    map?.remove();
});
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 400px;
}
</style>
```

## 🎨 Styling & CSS

The control uses CSS classes that can be customized:

```css
/* Main control container */
.mapboxgl-ctrl.mapboxgl-ctrl-group {
    /* Your custom styles */
}

/* Style switcher button */
.mapboxgl-style-switcher {
    /* Button styles */
}

/* Style list dropdown */
.mapboxgl-style-list {
    /* Dropdown styles */
}

/* Individual style buttons */
.mapboxgl-style-list button {
    /* Style button styles */
}

/* Active style button */
.mapboxgl-style-list button.active {
    /* Active state styles */
}
```

## 🔍 Demo & Examples

-   📝 [CodeSandbox Demo](https://codesandbox.io/s/elegant-night-wi9v4) - Interactive demo
-   🎮 [GitHub Pages Examples](https://deciosfernandes.github.io/style-switcher/) - Comprehensive examples

## 🛠️ Development

### Setup

```bash
git clone https://github.com/deciosfernandes/style-switcher.git
cd style-switcher
npm install
```

### Build

```bash
npm run build
```

### Development Workflow

The project uses modern TypeScript 5.9.3 with:

-   Optional chaining and nullish coalescing
-   Strict type checking
-   ES2018 target with ES2020 library features
-   Comprehensive JSDoc documentation

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

-   Follow TypeScript strict mode conventions
-   Add JSDoc comments for public APIs
-   Include unit tests for new features
-   Update documentation for API changes
-   Ensure backward compatibility when possible

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   Original concept by [Eliz Kilic](https://github.com/el/)
-   Built for the [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) ecosystem
-   TypeScript definitions inspired by the Mapbox GL JS type definitions

---

**Made with ❤️ for the Mapbox community**
