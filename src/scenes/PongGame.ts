import Phaser from "phaser";

export default class Pong extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.player = null;
    this.enemy = null;
    this.controls = null;
    this.ball = null;

    this.playerScore = 0;
    this.enemyScore = 0;

    this.minimumBallVelocity = 180
    this.paddleVelocity = 160
  }

  createPaddle(side: "left" | "right") {
    const xpos = side === "left" ? 200 : 600;
    const rect = this.add.rectangle(xpos, 300, 10, 100, 0xffffff);
    const physicsBody = this.physics.add.existing(rect).body;
    physicsBody.setCollideWorldBounds(true);
    physicsBody.setBounce(1);
    physicsBody.setImmovable(true);
    return rect;
  }

  endRound() {
    this.ball.body.stop();
    this.ball.setPosition(400, 300);
    this.enemy.body.setVelocityY(0);
    this.playerScoreText.setText(`Player score: ${this.playerScore}`)
    this.enemyScoreText.setText(`Enemy score: ${this.enemyScore}`)

    // Raise ball's and player velocity
    // Gets faster with every round!
    this.minimumBallVelocity += 40
    this.paddleVelocity += 40
  }

  moveBall() {
    const randomWithMinMaxNegToo = (min, max) => {
      return Phaser.Math.RND.pick([
        Phaser.Math.Between(min, max), 
        Phaser.Math.Between(-min, -max)
      ])
    }

    this.ball.body.setVelocity(
      randomWithMinMaxNegToo(this.minimumBallVelocity, this.minimumBallVelocity + 20),
      randomWithMinMaxNegToo(this.minimumBallVelocity, this.minimumBallVelocity + 20)
    )
  }

  updateEnemyPaddleMovement() {
    const ballY: number = this.ball.getCenter().y
    const enemyY: number = this.enemy.getCenter().y

    if (!checkIsMoving(this.ball)) return;

    // The lower the treshhold number, the faster enemy will react
    if (ballY > enemyY + 30) {
      this.enemy.body.setVelocityY(this.paddleVelocity)
    }
    else if (ballY < enemyY - 30) {
      this.enemy.body.setVelocityY(-this.paddleVelocity)
    }
  }

  create() {
    const paddingTop = 150;
    const paddingLeft = 80
    this.physics.world.setBounds(
      paddingLeft, paddingTop, 
      800 - (paddingLeft * 2), 600 - (paddingTop * 2));

    const playerScoreText = this.add.text(16, 16, `Player score: ${this.playerScore}`, { fontSize: '32px', fill: '#000' });
    const enemyScoreText = this.add.text(16, 48, `Enemy score: ${this.enemyScore}`, { fontSize: '32px', fill: '#000' });

    this.playerScoreText = playerScoreText;
    this.enemyScoreText = enemyScoreText;

    this.player = this.createPaddle("left");
    this.controls = this.input.keyboard.createCursorKeys();

    const enemyPaddle = this.createPaddle("right");
    this.enemy = enemyPaddle;

    const circle = this.add.ellipse(400, 300, 15, 15, 0xffffff);
    this.ball = this.physics.add.existing(circle);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.setBounce(1.1);

    this.physics.add.collider(this.ball, this.player);
    this.physics.add.collider(this.ball, enemyPaddle);
  
    this.ball.body.onWorldBounds = true;

    this.physics.world.on("worldbounds", 
      (body, collideUp, collideDown, collideLeft, collideRight) => {
        if (body.gameObject === this.ball) {
          if (collideRight) {
            this.playerScore++;
            this.endRound();
          }
          else if (collideLeft) {
            this.enemyScore++;
            this.endRound();
          }
        }
      }
    )
  }

  update() {
    if (this.controls.up.isDown) {
      this.player.body.setVelocityY(-this.paddleVelocity);
    }
    
    else if (this.controls.down.isDown) {
      this.player.body.setVelocityY(this.paddleVelocity);
    }

    else {
      this.player.body.setVelocityY(0)
    }

    if (this.controls.space.isDown) {
      if (!checkIsMoving(this.ball)) {
        this.moveBall()
      }
    }

    this.updateEnemyPaddleMovement()
  }

}

function checkIsMoving(gameObject) {
  return (
    gameObject.body.velocity.x !== 0 || 
    gameObject.body.velocity.y !== 0
  );
}