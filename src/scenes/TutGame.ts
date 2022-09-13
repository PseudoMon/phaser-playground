import Phaser from "phaser";

export default class TutorialGame extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
  }

  preload() {
    this.load.image('sky', 'tut-assets/sky.png');
    this.load.image('ground', 'tut-assets/platform.png');
    this.load.image('star', 'tut-assets/star.png');
    this.load.image('bomb', 'tut-assets/bomb.png');
    this.load.spritesheet('dude', 
        'tut-assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
  }

  createPlatforms() {
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    return platforms;
  }

  createPlayer() {
    const player = this.physics.add.sprite(100, 450, "dude");
    this.player = player;
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    return player;
  }

  create() {
    this.add.image(400, 300, "sky");

    const platforms = this.createPlatforms();
    const player = this.createPlayer();

    this.physics.add.collider(player, platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    const stars = this.physics.add.group({
      key: "star",
      repeat: 2,
      setXY: { x: 12, y: 0, stepX: 70 },
    })

    stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })

    const hitBomb = (player, bomb) => {
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      this.gameOver = true;
    }

    const bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    const collectStars = (_, star) => {
      star.disableBody(true, true);
      this.score += 10;
      scoreText.setText(`Score: ${this.score}`);

      if (stars.countActive(true) === 0) {
        stars.children.iterate((child) => {
          child.enableBody(true, child.x, 0, true, true)
        })

        const xpos = this.player.x < 400 ? 
          Phaser.Math.Between(400, 800) :
          Phaser.Math.Between(0, 400);

        const bomb = bombs.create(xpos, 16, "bomb")
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
      }
    }

    this.physics.add.collider(stars, platforms)
    this.physics.add.overlap(
      player, stars, 
      collectStars, 
      null, this
    )
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    }
    
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    }

    else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}