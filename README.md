# Globe-1

A modern interactive 3D globe visualization web app built with React, Cesium, and Resium. This project showcases key infrastructure, officials, and photo galleries related to the China-Pakistan Economic Corridor (CPEC).

## Features
- 3D globe visualization using Cesium
- Sidebar with key officials and project information
- Interactive photo gallery modal
- Geocoding and camera controls
- Responsive UI with modern design

## Tech Stack
- [React](https://react.dev/) (TypeScript)
- [CesiumJS](https://cesium.com/platform/cesiumjs/)
- [Resium](https://resium.darwineducation.com/)
- [Vite](https://vitejs.dev/) for fast development

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```

## Project Structure
```
src/           # Source code (React components, styles)
public/assets/ # Images and static assets
index.html     # Main HTML file
vite.config.ts # Vite configuration
```

## Main Components
- `Globe.tsx`: Renders the Cesium globe
- `CPECSidebarNew.tsx`: Sidebar for CPEC info
- `KeyOfficialsSidebar.tsx`: Sidebar for officials
- `PhotoGalleryModal.tsx`: Modal for images
- `CameraController.ts`: Camera movement logic
- `GeocodingService.ts`: Location search

## Customization
- Add or update images in `public/assets/`
- Modify sidebar content in `src/CPECSidebarNew.tsx` and `src/KeyOfficialsSidebar.tsx`

## License
MIT

## Credits
- CesiumJS for 3D globe rendering
- Resium for React bindings
- All images © respective owners
