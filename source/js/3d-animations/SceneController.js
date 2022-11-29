import { infrastructure } from "./initAnimationScreen";
import { LatheGeometryCreator } from "./creators/LatheGeometryCreator";
import { MaterialCreator } from "./creators/MaterialCreator";
import { MainPageScene } from "./scenes/main-page/MainPageScene";
import { SvgPathsLoader } from "./loaders/SvgPathsLoader";
import { EXTRUDE_SETTINGS, OBJECT_ELEMENTS, SVG_ELEMENTS } from "../constants";
import { ExtrudeSvgCreator } from "./creators/ExtrudeSvgCreator";
import { ObjectsCreator } from "./creators/ObjectCreator";
import { RoomsPageScene } from "./scenes/room-page/RoomsPageScene";
// import { TransformationGuiHelper } from "./ProjectGui/TransformationGuiHelper";
import { PageSceneCreator } from "./scenes/PageSceneCreator";
import { AnimationManager } from "./controllers/AnimationManager";
import { CameraRig } from "./rigs/CameraRig/CameraRig";
import { createObjectTransformAnimation } from "./creators/animationCreators";
import { easeInCubic, easeInOutSine, easeOutCubic } from "../helpers/easing";
import * as THREE from 'three';

const materialCreator = new MaterialCreator();
const latheGeometryCreator = new LatheGeometryCreator();
const svgShapeLoader = new SvgPathsLoader(SVG_ELEMENTS);
const extrudeSvgCreator = new ExtrudeSvgCreator(
  svgShapeLoader,
  EXTRUDE_SETTINGS
);
const objectCreator = new ObjectsCreator();
// const transformationGuiHelper = new TransformationGuiHelper();
const pageSceneCreator = new PageSceneCreator(
  materialCreator,
  extrudeSvgCreator,
  objectCreator,
  latheGeometryCreator
  // transformationGuiHelper
);

const animationManager = new AnimationManager();

export class SceneController {
  constructor() {
    this.previousRoomSceneIndex = 1;
    this.isSuitcaseAppear = false;
    this.isMainPageObjectsAppear = false;
  }

  async initScene(startSceneIndex) {
    await this.addMainPageScene();
    await this.addRoomsPageScene();
    await this.initSuitCase();

    if (startSceneIndex === 0) {
      animationManager.startMainPageAnimations();
      this.isMainPageObjectsAppear = true;
    } else {
      animationManager.startRoomAnimations(0);
      animationManager.startSuitcaseAnimations();
      this.isSuitcaseAppear = true;
    }

    this.addCameraRig(startSceneIndex);
  }

  async addMainPageScene() {
    this.mainPageScene = new MainPageScene(pageSceneCreator, animationManager);

    await this.mainPageScene.constructChildren();

    infrastructure.addSceneObject(this.mainPageScene);
  }

  async addRoomsPageScene() {
    this.roomsPageScene = new RoomsPageScene(
      pageSceneCreator,
      animationManager
    );

    await this.roomsPageScene.constructChildren();

    this.roomsPageScene.position.set(0, -700, -3270);

    infrastructure.addSceneObject(this.roomsPageScene);
  }

  async initSuitCase() {
    const suitcase = await pageSceneCreator.createObjectMesh({
      name: OBJECT_ELEMENTS.suitcase,
      transform: {
        position: {
          x: -340,
          y: 150,
          z: 750,
        },
        rotation: {
          y: -0.4,
        },
      },
    });

    this.suitcase = new THREE.Group();

    this.suitcase.position.y = this.roomsPageScene.position.y

    this.suitcase.add(suitcase);

    suitcase.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    animationManager.addSuitcaseAnimations(
      createObjectTransformAnimation(
        suitcase,
        {
          position: {
            y: 0,
          },
          scale: {
            x: 0.95,
            y: 1.1,
            z: 0.95,
          },
        },
        {
          duration: 300,
          easing: easeInCubic,
        }
      ),
      createObjectTransformAnimation(
        suitcase,
        {
          position: {
            y: 2,
          },
          scale: {
            x: 1.05,
            y: 0.93,
            z: 1.05,
          },
        },
        {
          duration: 150,
          delay: 300,
          easing: easeOutCubic,
        }
      ),
      createObjectTransformAnimation(
        suitcase,
        {
          position: {
            y: 1,
          },
          scale: {
            x: 0.98,
            y: 1.04,
            z: 0.98,
          },
        },
        {
          duration: 150,
          delay: 450,
          easing: easeInOutSine,
        }
      ),
      createObjectTransformAnimation(
        suitcase,
        {
          position: {
            y: 0,
          },
          scale: {
            x: 1,
            y: 1,
            z: 1,
          },
        },
        {
          duration: 150,
          delay: 600,
          easing: easeInCubic,
        }
      )
    );
  }

  addCameraRig(startSceneIndex) {
    this.cameraRig = new CameraRig(
      CameraRig.getCameraRigStageState(startSceneIndex)
    );

    this.cameraRig.addObjectToCameraNull(infrastructure.camera);
    this.cameraRig.addObjectToCameraNull(infrastructure.light);
    this.cameraRig.addObjectToRotationAxis(this.suitcase);

    infrastructure.scene.add(this.cameraRig);
  }

  showMainScene() {
    this.cameraRig.changeStateTo(CameraRig.getCameraRigStageState(0));

    setTimeout(() => {
      if (!this.isMainPageObjectsAppear) {
        animationManager.startMainPageAnimations();
        this.isMainPageObjectsAppear = true;
      }
    }, 500);
  }

  showRoomScene(index) {
    if (typeof index === "number") {
      this.previousRoomSceneIndex = index;
    }

    this.cameraRig.changeStateTo(
      CameraRig.getCameraRigStageState(index || this.previousRoomSceneIndex)
    );

    animationManager.startRoomAnimations(
      (index || this.previousRoomSceneIndex) - 1
    );

    setTimeout(() => {
      if (!this.isSuitcaseAppear) {
        animationManager.startSuitcaseAnimations();
        this.isSuitcaseAppear = true;
      }
    }, 800);
  }
}
