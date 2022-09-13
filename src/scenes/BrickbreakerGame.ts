export default class Brickbreaker extends Phaser.Scene {
  constructor() {
    super("BrickbreakerMain");
  }

  preload() {
    this.load.setPath("brickbreaker-assets");
    this.load.image("cleanBrick", "brick.png");
    this.load.image("brokenBrick", "brick-broken.png");
  }

  create() {
    
  }
}