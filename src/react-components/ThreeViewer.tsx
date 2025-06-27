import * as React from "react";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function ThreeViewer() {
    let scene: THREE.Scene | null;
    let mesh: THREE.Object3D | null;
    let renderer: THREE.WebGLRenderer | null;
    let cameraControls: OrbitControls | null;
    let camera: THREE.PerspectiveCamera | null;
    let axes: THREE.AxesHelper | null;
    let grid: THREE.GridHelper | null;
    let directionalLight: THREE.DirectionalLight | null;
    let spotLight: THREE.SpotLight | null;
    let ambientLight: THREE.AmbientLight | null;
    let mtlLoader: MTLLoader | null;
    let objLoader: OBJLoader | null;
    let lightParent: THREE.Object3D | null;

    const setViewer = () => {
        scene = new THREE.Scene()

        const viewerContainer = document.getElementById("viewerContainer") as HTMLDivElement

        camera = new THREE.PerspectiveCamera(75)
        camera.position.z = 5

        // Clear the container
        viewerContainer.innerHTML = "";

        // Create and append the renderer
        renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        viewerContainer.append(renderer.domElement);

        function resizeViewer(){
            if(!renderer) return
            const containerDimensions = viewerContainer.getBoundingClientRect()
            renderer.setSize(containerDimensions.width, containerDimensions.height)
            const aspectRatio = containerDimensions.width / containerDimensions.height
            if(!camera) return
            camera.aspect = aspectRatio
            camera.updateProjectionMatrix()
        }

        window.addEventListener("resize", resizeViewer)

        resizeViewer()

        renderer.render(scene, camera)

        //create spot Light
        spotLight = new THREE.SpotLight()
        spotLight.position.set(2, 2, 2)
        spotLight.intensity = 0.5

        //const directionalLight = new THREE.DirectionalLight()
        ambientLight = new THREE.AmbientLight()
        ambientLight.intensity = 0.4

        cameraControls = new OrbitControls(camera, viewerContainer)

        function renderScene() {
            if(!renderer) return
            if(!scene) return
            if(!camera) return
            renderer.render(scene, camera)
            requestAnimationFrame(renderScene)
        }

        renderScene()

        axes = new THREE.AxesHelper()
        grid = new THREE.GridHelper(10, 10)
        grid.material.transparent = true
        grid.material.opacity = 1
        grid.material.color = new THREE.Color("#1CFFCA")

        scene.add(axes, grid)

        // Create a parent object for the light
        lightParent = new THREE.Object3D();
        scene.add(lightParent);
        // Create the directional light and add it to the parent
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        lightParent.add(directionalLight);

        //OBJ LOADER 
        objLoader = new OBJLoader()
        mtlLoader = new MTLLoader()

        mtlLoader.load("/assets/Gear/Gear1.mtl", (materials) => {
            materials.preload()
            if(!objLoader) return
            objLoader.setMaterials(materials)
            objLoader.load("/assets/Gear/Gear1.obj", (object) => {
                if(!scene) return
                scene.add(object)
                mesh = object
            })
        })

        //GLTF LOADER
        const gltfLoader = new GLTFLoader()
        gltfLoader.load("/assets/fossil/scene.gltf", (gltf) => {
            if(!scene) return
            scene.add(gltf.scene)
        })
    }

    React.useEffect(() => {
        setViewer()            
        return () => {
            mesh?.removeFromParent
            mesh?.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                    
                }
            })
            mesh = null;
        }
    }, [])

    return (
        <div 
            id="viewerContainer" 
            className="dashboardCard" 
            style={{ minWidth:0 }}
        />
    )
}