import { Camera, Cartesian3, EasingFunction, Rectangle } from 'cesium';

interface RotateAndZoomOptions {
  duration?: number;
  zoomHeight?: number;
}

export class CameraController {
  private camera: Camera;

  constructor(camera: Camera) {
    this.camera = camera;
  }

  /**
   * Smoothly rotates the globe to the target location and then zooms in.
   * If the distance is large, it performs a two-phase animation:
   * 1. Fly to the location at a high altitude (Global rotation)
   * 2. Zoom in to the target height
   */
  rotateAndZoomTo(lon: number, lat: number, options: RotateAndZoomOptions = {}) {
    const { duration = 3.0, zoomHeight = 2000 } = options;
    
    // Convert lat/lon to Cartesian3
    const destination = Cartesian3.fromDegrees(lon, lat, zoomHeight);

    // Calculate distance to determine animation strategy (Future enhancement: adaptive duration based on distance)
    // const currentPosition = this.camera.positionWC;
    // const distance = Cartesian3.distance(currentPosition, destination);

    // If distance is significant (> 5000km approx), use a flyTo with auto duration
    // Cesium's flyTo handles the curve automatically (up then down)
    this.camera.flyTo({
      destination: destination,
      duration: duration,
      easingFunction: EasingFunction.QUADRATIC_IN_OUT,
    });
  }

  /**
   * Flies to a bounding box (e.g. city or region extent)
   */
  flyToBoundingBox(bbox: [number, number, number, number]) {
    // bbox is [minLat, maxLat, minLon, maxLon]
    const [minLat, maxLat, minLon, maxLon] = bbox;

    const rectangle = Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat);

    this.camera.flyTo({
      destination: rectangle,
      duration: 2.0,
      easingFunction: EasingFunction.CUBIC_IN_OUT,
    });
  }
}
