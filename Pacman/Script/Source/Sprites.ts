namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  const clrWhite: ƒ.Color = ƒ.Color.CSS("white");

  let animations: ƒAid.SpriteSheetAnimations;
  let spriteNode: ƒAid.NodeSprite;

  export async function setPacman(_node: ƒ.Node): Promise<void> {
    spriteNode = new ƒAid.NodeSprite("Sprite");
    spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spriteNode.setAnimation(<ƒAid.SpriteSheetAnimation>animations["pacman"]);
    spriteNode.setFrameDirection(1);
    spriteNode.framerate = 10;
    spriteNode.mtxLocal.translateZ(0.5);
    spriteNode.mtxLocal.translateY(0.2);
    spriteNode.mtxLocal.translateX(0.1);
    _node.addChild(spriteNode);
  }

  export async function loadSprites(): Promise<void> {
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("Sprites/pacmanRight.png");

    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(
      clrWhite,
      imgSpriteSheet
    );
    generateSprites(spriteSheet);
  }

  function generateSprites(_spritesheet: ƒ.CoatTextured): void {
    animations = {};
    let name: string = "pacman";
    let sprite: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(
      name,
      _spritesheet
    );
    sprite.generateByGrid(
      ƒ.Rectangle.GET(0, 0, 46, 46),
      4,
      47,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(43)
    );
    animations[name] = sprite;
  }

  export function rotatePacman(_newDir: Direction, _dir: Direction) {
    switch (_dir) {
      case Direction.Left:
        switch (_newDir) {
          case Direction.Right:
            spriteNode.mtxLocal.rotateZ(180);
            break;
          case Direction.Up:
            spriteNode.mtxLocal.rotateZ(-90);
            break;
          case Direction.Down:
            spriteNode.mtxLocal.rotateZ(90);
            break;
          case Direction.Left:
            break;
        }
        break;
      case Direction.Right:
        switch (_newDir) {
          case Direction.Right:
            break;
          case Direction.Up:
            spriteNode.mtxLocal.rotateZ(90);
            break;
          case Direction.Down:
            spriteNode.mtxLocal.rotateZ(-90);
            break;
          case Direction.Left:
            spriteNode.mtxLocal.rotateZ(180);
            break;
        }
        break;
      case Direction.Up:
        switch (_newDir) {
          case Direction.Right:
            spriteNode.mtxLocal.rotateZ(-90);
            break;
          case Direction.Up:
            break;
          case Direction.Down:
            spriteNode.mtxLocal.rotateZ(180);
            break;
          case Direction.Left:
            spriteNode.mtxLocal.rotateZ(90);
            break;
        }
        break;
      case Direction.Down:
        switch (_newDir) {
          case Direction.Right:
            spriteNode.mtxLocal.rotateZ(90);
            break;
          case Direction.Up:
            spriteNode.mtxLocal.rotateZ(180);
            break;
          case Direction.Down:
            break;
          case Direction.Left:
            spriteNode.mtxLocal.rotateZ(-90);
            break;
        }
        break;
    }
  }
}
