# 3D Tiles Pipeline: Photogrammetry to Cesium 3D Tiles

This guide describes how to convert photogrammetry datasets (from drone imagery or other sources) into Cesium 3D Tiles for streaming on the globe.

## Prerequisites

*   **Photogrammetry Software**: WebODM (OpenDroneMap) or RealityCapture / ContextCapture.
*   **Hosting/Tiling**: Cesium ion (easiest) or open-source tools.

## Option 1: WebODM (Open Source)

1.  **Process Imagery**:
    *   Upload images to WebODM.
    *   Select the "3D Model" task options.
    *   Ensure `obj` and `gltf` exports are enabled.

2.  **Export**:
    *   Download the textured 3D model (OBJ or GLTF/GLB).

3.  **Convert to 3D Tiles**:
    *   **Method A: Cesium ion (Cloud)**
        1.  Create an account at [cesium.com/ion](https://cesium.com/ion).
        2.  Go to "My Assets" -> "Add Asset".
        3.  Upload your OBJ/GLB file.
        4.  Select "3D Model (Tile as 3D Tiles)" as the type.
        5.  Once processed, you will get an Asset ID.
        6.  Update `src/Globe.tsx` to use this Asset ID:
            ```typescript
            <Cesium3DTileset url={IonResource.fromAssetId(YOUR_ASSET_ID)} />
            ```

    *   **Method B: 3d-tiles-tools (Local / Offline)**
        1.  Install the tools: `npm install -g 3d-tiles-tools`
        2.  Convert glb to b3dm (Batched 3D Model) or create a tileset.json structure.
        3.  *Note*: For high-quality LODs, Cesium ion's tiler is generally superior to simple open-source converters for raw meshes.

## Option 2: RealityCapture / ContextCapture (Proprietary)

1.  **Process**: Run your reconstruction.
2.  **Export**:
    *   Both software packages have native support for exporting to **Cesium 3D Tiles**.
    *   Choose "Cesium 3D Tiles" format in the export dialog.
    *   This will generate a folder with `tileset.json` and `.b3dm` files.
3.  **Host**:
    *   Upload the folder to an S3 bucket or any static web server.
    *   Enable CORS on the server.
    *   Point your `Cesium3DTileset` url to the `tileset.json` path.

## Optimization Tips for Production

*   **Draco Compression**: Always enable Draco compression when tiling. It reduces geometry size significantly.
*   **Texture Compression**: Use KTX2 / Basis Universal textures for smaller GPU memory footprint.
*   **LOD Strategy**: Ensure your pipeline generates a good hierarchy of LODs. The root tile should be very low poly.

## Using the Data in This App

To use your custom tileset:

1.  Get the URL (or Ion Asset ID).
2.  In `src/Globe.tsx`:

```tsx
// For Cesium ion asset
<Cesium3DTileset url={IonResource.fromAssetId(12345)} />

// For self-hosted tileset
<Cesium3DTileset url="https://my-bucket.s3.amazonaws.com/my-city/tileset.json" />
