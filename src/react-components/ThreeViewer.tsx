import * as React from "react";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function ThreeViewer() {
    const viewerContainerRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        if (!viewerContainerRef.current) return undefined;

        let scene: THREE.Scene | null = null;
        let mesh: THREE.Object3D | null = null;
        let renderer: THREE.WebGLRenderer | null = null;
        let cameraControls: OrbitControls | null = null;
        let camera: THREE.PerspectiveCamera | null = null;
        let axes: THREE.AxesHelper | null = null;
        let grid: THREE.GridHelper | null = null;
        let directionalLight: THREE.DirectionalLight | null = null;
        let spotLight: THREE.SpotLight | null = null;
        let ambientLight: THREE.AmbientLight | null = null;
        let mtlLoader: MTLLoader | null = null;
        let objLoader: OBJLoader | null = null;
        let lightParent: THREE.Object3D | null = null;
        let animationId: number | null = null;

        const viewerContainer = viewerContainerRef.current;

        const initViewer = () => {
            scene = new THREE.Scene();
            
            camera = new THREE.PerspectiveCamera(75);
            camera.position.z = 5;

            // Clear the container
            viewerContainer.innerHTML = "";

            // Create and append the renderer
            renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
            viewerContainer.appendChild(renderer.domElement);

            function resizeViewer(){
                if(!renderer || !camera) return;
                const containerDimensions = viewerContainer.getBoundingClientRect();
                renderer.setSize(containerDimensions.width, containerDimensions.height);
                const aspectRatio = containerDimensions.width / containerDimensions.height;
                camera.aspect = aspectRatio;
                camera.updateProjectionMatrix();
            }

            window.addEventListener("resize", resizeViewer);

            resizeViewer();

            renderer.render(scene, camera);

            //create spot Light
            spotLight = new THREE.SpotLight();
            spotLight.position.set(2, 2, 2);
            spotLight.intensity = 0.5;

            //const directionalLight = new THREE.DirectionalLight()
            ambientLight = new THREE.AmbientLight();
            ambientLight.intensity = 0.4;

            cameraControls = new OrbitControls(camera, viewerContainer);

            function renderScene() {
                if(!renderer || !scene || !camera) return;
                renderer.render(scene, camera);
                animationId = requestAnimationFrame(renderScene);
            }

            renderScene();

            axes = new THREE.AxesHelper();
            grid = new THREE.GridHelper(10, 10);
            grid.material.transparent = true;
            grid.material.opacity = 1;
            grid.material.color = new THREE.Color("#1CFFCA");

            scene.add(axes, grid);

            // Create a parent object for the light
            lightParent = new THREE.Object3D();
            scene.add(lightParent);
            // Create the directional light and add it to the parent
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5);
            lightParent.add(directionalLight);

            //OBJ LOADER 
            objLoader = new OBJLoader();
            mtlLoader = new MTLLoader();

            mtlLoader.load("/assets/Gear/Gear1.mtl", (materials) => {
                materials.preload();
                if(!objLoader || !scene) return;
                objLoader.setMaterials(materials);
                objLoader.load("/assets/Gear/Gear1.obj", (object) => {
                    if(!scene) return;
                    scene.add(object);
                    mesh = object;
                });
            });

            //GLTF LOADER
            const gltfLoader = new GLTFLoader();
            gltfLoader.load("/assets/fossil/scene.gltf", (gltf) => {
                if(!scene) return;
                scene.add(gltf.scene);
            });

            // Return cleanup function
            return () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                window.removeEventListener("resize", resizeViewer);
                
                mesh?.removeFromParent();
                mesh?.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
                
                renderer?.dispose();
                cameraControls?.dispose();
            };
        };

        const cleanup = initViewer();

        return cleanup;
    }, []);

    return (
        <div 
            ref={viewerContainerRef}
            className="dashboardCard" 
            style={{ minWidth: 0 }}
        />
    );
}