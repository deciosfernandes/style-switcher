import { ControlPosition, IControl, Map as MapboxMap } from 'mapbox-gl';
export interface MapboxStyleDefinition {
    title: string;
    uri: string;
}
export interface MapboxStyleSwitcherOptions {
    defaultStyle?: string;
    eventListeners?: MapboxStyleSwitcherEvents;
}
export interface MapboxStyleSwitcherEvents {
    onOpen?: (event: MouseEvent) => boolean;
    onSelect?: (event: MouseEvent) => boolean;
    onChange?: (event: MouseEvent, style: string) => boolean;
}
export declare class MapboxStyleSwitcherControl implements IControl {
    private static readonly DEFAULT_STYLE;
    private static readonly DEFAULT_STYLES;
    private controlContainer;
    private readonly events?;
    private map;
    private mapStyleContainer;
    private styleButton;
    private readonly styles;
    private readonly defaultStyle;
    constructor(styles?: MapboxStyleDefinition[], options?: MapboxStyleSwitcherOptions | string);
    private validateDefaultStyle;
    getDefaultPosition(): ControlPosition;
    onAdd(map: MapboxMap): HTMLElement;
    private createControlContainer;
    private createStyleContainer;
    private createStyleButton;
    private createStyleButtons;
    private createIndividualStyleButton;
    private handleStyleButtonClick;
    private updateActiveStyleButton;
    private setupEventListeners;
    onRemove(): void;
    private closeModal;
    private openModal;
    private onDocumentClick;
    getCurrentStyle(): MapboxStyleDefinition | null;
    setStyle(styleName: string): boolean;
    getStyles(): ReadonlyArray<MapboxStyleDefinition>;
}
