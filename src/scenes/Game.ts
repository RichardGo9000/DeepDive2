import Phaser from 'phaser';
import getRandomFloat from '../modules/getRandomFloat.js';
import range from '../modules/range.js';

export default class Demo extends Phaser.Scene {
  playerSprite: Phaser.Physics.Arcade.Sprite | undefined = undefined;
  platforms: Phaser.Physics.Arcade.StaticGroup | undefined = undefined;
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined = undefined;

  // private ballast = 100;  //empty is -100, full is 100, and vessel is flooding when above 100
  // private battery = 100;  //empty is 0, full is 100
  // private life = 100;  //represents how damaged the ship has received
  // private oxygen = 100;
  private topOpen = false;
  private bottomOpen = false;

  

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('background', 'assets/bg_layer1.png');
    this.load.image('logo', 'assets/Sample-Logo.png');
    // Load platforms
    this.load.image('platform-cake', 'assets/platforms/ground_cake.png');
    this.load.image('platform-grass', 'assets/platforms/ground_grass.png');
    this.load.image('platform-sand', 'assets/platforms/ground_sand.png');
    // Load the player sprite
    // this.load.spritesheet('mallory', 'assets/player-sheet.png', { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet('DeepSubmergenceVehicle', 'assets/DSVSpriteSheet.png', { frameWidth: 1024, frameHeight: 1024 });

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  

  create() {
    this.add.image(920, 550, 'background').setScale(0.4);
    const logo = this.add.image(920, 70, 'logo');

    // Create platforms
    this.platforms = this.physics.add.staticGroup();

    // Draw platforms (of different biomes) randomly
    // Starting at two because the minimum Y we want is over 190
    [...range(2, 8)].forEach((i) => {
      const x = Phaser.Math.Between(600, 1200);
      const y = 110 * i;

      // Choose a biome at random
      const biome = ['cake', 'grass', 'sand'][Phaser.Math.Between(0, 2)];
      // Create a platform of that biome
      const platform = this.platforms?.create(x, y, `platform-${biome}`) as Phaser.Physics.Arcade.Sprite;
      // Give the platform a random scale
      platform.scale = 0.5 + (getRandomFloat(0, .3, 2));

      const body = platform.body as Phaser.Physics.Arcade.StaticBody;
      body.updateFromGameObject()
    });

    // Draw the player sprite
    // this.playerSprite = this.physics.add.sprite(940, 320, 'mallory', 0).setScale(2);
    // this.playerSprite = this.physics.add.sprite(940, 320, 'DSV', 0).setScale(2);
    this.playerSprite = this.physics.add.sprite(940, 320, 'DSV', 0).setScale(0.3);

    this.playerSprite.body.checkCollision.up = false;
    this.playerSprite.body.checkCollision.left = false;
    this.playerSprite.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.playerSprite)

    this.anims.create({
      key: 'move',
      frameRate: 7,
      //  11 frames,  0-3 open top hatch, 4-7 open bottom hatch, 8-10 bubbles, 1024x1024
      frames: this.anims.generateFrameNumbers('DeepSubmergenceVehicle', { start: 8, end: 10 }),

      repeat: -1
    });

    this.anims.create({
      key: 'stop',
      frameRate: 7,
      // frames: this.anims.generateFrameNumbers('DeepSubmergenceVehicle', { start: 0, end: 4 }),
      frames: this.anims.generateFrameNumbers('DeepSubmergenceVehicle', { start: 0, end: 0 }),
      //here is where we need to add in bubbles animation
      repeat: -1  //this should change
    });

    this.anims.create({
      key: 'stopOpenTop',
      frameRate: 7,
      // frames: this.anims.generateFrameNumbers('DeepSubmergenceVehicle', { start: 0, end: 4 }),
      frames: this.anims.generateFrameNumbers('DeepSubmergenceVehicle', { start: 3, end: 3 }),
      //here is where we need to add in bubbles animation
      repeat: -1  //this should change
    });

    this.anims.create({
      key: 'openTop',
      frameRate: 7,
      // frames: this.anims.generateFrameNumbers('DeepSubmergenceVehicle', { start: 0, end: 4 }),
      frames: this.anims.generateFrameNumbers('DeepSubmergenceVehicle', { start: 0, end: 3 }),
      //here is where we need to add in bubbles animation
      repeat: 0  //this should change
    });

    // this.anims.create({
    //   key: 'move',
    //   frameRate: 15,
    //   frames: this.anims.generateFrameNumbers('DSV', {start: 0, end: 4}),
    //   repeat: -1
    // });

    // Add collision detection
    this.physics.add.collider(this.platforms, this.playerSprite);

    this.tweens.add({
      targets: logo,
      y: 90,
      duration: 900,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  

  update(time: number, delta: number): void {
    const { playerSprite, cursorKeys } = this as { playerSprite: Phaser.Physics.Arcade.Sprite, cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys };
    // const { left, right } = cursorKeys;
    const { up, down, left, right } = cursorKeys;

    // const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    // const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    // const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    // const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    const keyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);  //this will toggle top door, but should be changed to a better key 

    const touchingGround = playerSprite.body.touching.down;

    const openTopDoor = () => {
      console.log('openTopDoor() called');
      if (this.topOpen) {
        this.topOpen = false;
        // playerSprite.anims.play('closeTop', true);
        playerSprite.anims.playReverse('openTop', true);
      } else {
        this.topOpen = true;
        playerSprite.anims.play('openTop', true);
      }
    }

    // Jump when you touch a platform
    // if (touchingDown) playerSprite.setVelocityY(-300);
    // if (touchingDown) playerSprite.setVelocityY(0);
    if (touchingGround) playerSprite.setVelocityY(1);

    if (keyT.isDown) {
      playerSprite.setVelocityX(0);
      playerSprite.setVelocityY(0);
      openTopDoor();
      // if (this.topOpen) {
      //   this.topOpen = false;
      //   // playerSprite.anims.play('closeTop', true);
      //   playerSprite.anims.playReverse('openTop', true);
      // } else {
      //   this.topOpen = true;
      //   playerSprite.anims.play('openTop', true);
      // }
      // playerSprite.anims.play('openTop', true);
    } else if (left.isDown) {
      playerSprite.anims.play('move', true);
      playerSprite.setVelocityX(-200);
      playerSprite.flipX = false;
      // } else if (right.isDown && !touchingGround) {
    } else if (right.isDown) {
      playerSprite.anims.play('move', true);
      playerSprite.setVelocityX(200);
      playerSprite.flipX = true;
    } else if (up.isDown) {
      playerSprite.anims.play('stop', true);
      playerSprite.anims.stop();
      // playerSprite.anims.play('move', true);
      playerSprite.setVelocityY(-200);
    } else if (down.isDown) {
      playerSprite.anims.play('stop', true);
      playerSprite.anims.stop();
      // playerSprite.anims.play('move', true);
      playerSprite.setVelocityY(200);
    } else {
      playerSprite.setVelocityX(0);
      if (this.topOpen) {

      } else if (this.bottomOpen) {

      } else {
        playerSprite.anims.play('stop', true);
        playerSprite.anims.stop();
      }
      // playerSprite.anims.play('stop', true);
      // playerSprite.anims.stop();
    }


  }
}
