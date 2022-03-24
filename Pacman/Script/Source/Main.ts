namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let speed: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let graph: ƒ.Node = viewport.getBranch();
    pacman = graph.getChildrenByName("pacman")[0];

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.D,
        ƒ.KEYBOARD_CODE.ARROW_RIGHT,
      ]) &&
      pacman.mtxLocal.translation.y % 1 < 0.05
    ) {
      speed = new ƒ.Vector3(1 / 60, 0, 0);
    } else if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A]) ||
      (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT]) &&
        pacman.mtxLocal.translation.y % 1 < 0.05)
    ) {
      speed = new ƒ.Vector3(-1 / 60, 0, 0);
    } else if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W]) ||
      (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP]) &&
        pacman.mtxLocal.translation.x % 1 < 0.05)
    ) {
      speed = new ƒ.Vector3(0, 1 / 60, 0);
    } else if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S]) ||
      (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN]) &&
        pacman.mtxLocal.translation.y % 1 < 0.05)
    ) {
      speed = new ƒ.Vector3(0, -1 / 60, 0);
    }

    pacman.mtxLocal.translate(speed);
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}
