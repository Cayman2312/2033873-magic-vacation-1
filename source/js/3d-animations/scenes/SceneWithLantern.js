import * as THREE from "three";
import { Lantern } from "../mesh-complex-objects/Lantern";
import { Snowman } from "../mesh-complex-objects/Snowman";
import { MaterialCreator } from "../creators/MaterialCreator";
import { degreesToRadians } from "../utils/degreesToRadians";
import { MATERIAL_TYPE } from "../../constants";

export class SceneWithLantern extends THREE.Group {
  constructor(materialCreator) {
    super();

    this.materialCreator = materialCreator;
    this.constructChildren();
  }

  constructChildren() {
    this.addPyramid();
    this.addLantern();
    this.addSnowman();
  }

  addPyramid() {
    const pyramid = new THREE.Mesh(
      new THREE.ConeGeometry(250 / Math.pow(2, 0.5), 280, 4),
      this.materialCreator.create(MATERIAL_TYPE.SoftMaterial, {
        color: MaterialCreator.Colors.Blue,
      })
    );

    pyramid.position.set(0, 140, 0);

    this.add(pyramid);
  }

  addLantern() {
    const lantern = new Lantern(this.materialCreator);
    lantern.position.set(400, 0, 0);

    this.add(lantern);
  }

  addSnowman() {
    const snowman = new Snowman(this.materialCreator);
    snowman.rotateY(degreesToRadians(45));
    snowman.position.set(-400, 0, 0);

    this.add(snowman);
  }
}
