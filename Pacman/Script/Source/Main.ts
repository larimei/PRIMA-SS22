namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  enum Direction {
    None = "NONE",
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
  }

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let speed: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let direction = Direction.None;
  let newDirection = Direction.None;

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let graph: ƒ.Node = viewport.getBranch();
    pacman = graph.getChildrenByName("pacman")[0];

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function outOfPlayground(dir: string): boolean {
    switch (dir) {
      case "LEFT":
        if (pacman.mtxLocal.translation.x <= 0) {
          return true;
        } else {
          return false;
        }
      case "RIGHT":
        if (pacman.mtxLocal.translation.x >= 4) {
          return true;
        } else {
          return false;
        }
      case "UP":
        if (pacman.mtxLocal.translation.y >= 4) {
          return true;
        } else {
          return false;
        }
      case "DOWN":
        if (pacman.mtxLocal.translation.y <= 0) {
          return true;
        } else {
          return false;
        }
      default:
        return false;
    }
  }

  function checkDirectionection(): void {
    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])
    ) {
      newDirection = Direction.Left;
    }
    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D])
    ) {
      newDirection= Direction.Right;
    }
    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])
    ) {
      newDirection = Direction.Up;
    }
    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])
    ) {
      newDirection= Direction.Down;
    }
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    checkDirectionection();

    if (
      newDirection == "RIGHT" &&
      pacman.mtxLocal.translation.y % 1 < 0.05 &&
      outOfPlayground(newDirection) == false
    ) {
      direction = Direction.Right;
      speed = new ƒ.Vector3(1 / 60, 0, 0);
    }
    if (
      newDirection == "LEFT" &&
      pacman.mtxLocal.translation.y % 1 < 0.05 &&
      outOfPlayground(newDirection) == false
    ) {
      direction = Direction.Left;

      speed = new ƒ.Vector3(-1 / 60, 0, 0);
    }
    if (
      newDirection == "UP" &&
      pacman.mtxLocal.translation.x % 1 < 0.05 &&
      outOfPlayground(newDirection) == false
    ) {
      direction = Direction.Up;
      speed = new ƒ.Vector3(0, 1 / 60, 0);
    }
    if (
      newDirection == "DOWN" &&
      pacman.mtxLocal.translation.x % 1 < 0.05 &&
      outOfPlayground(newDirection) == false
    ) {
      direction = Direction.Down;
      speed = new ƒ.Vector3(0, -1 / 60, 0);
    }

    if (outOfPlayground(direction)) {
      speed = new ƒ.Vector3(0, 0, 0);
    }

    pacman.mtxLocal.translate(speed);
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}
