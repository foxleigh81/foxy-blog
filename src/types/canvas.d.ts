interface HTMLCanvasElement {
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void;
}
