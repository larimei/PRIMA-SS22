namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
  }

  let dialog: HTMLDialogElement;

  window.addEventListener("load", init);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let ghost: ƒ.Node;
  let walls: ƒ.Node[];
  let paths: ƒ.Node[];

  let sounds: ƒ.ComponentAudio[];

  let direction: Direction;
  let speed: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);

  function init(_event: Event): void {
    dialog = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event: Event) {
      // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
      dialog.close();
      startInteractiveViewport();
    });
    // @ts-ignore
    dialog.showModal();
  }

  async function startInteractiveViewport(): Promise<void> {
    // load resources referenced in the link-tag
    await ƒ.Project.loadResourcesFromHTML();
    ƒ.Debug.log("Project:", ƒ.Project.resources);
    // pick the graph to show
    let graph: ƒ.Graph = ƒ.Project.resources[
      "Graph|2022-03-17T14:08:08.737Z|08207"
    ] as ƒ.Graph;
    ƒ.Debug.log("Graph:", graph);
    if (!graph) {
      alert(
        "Nothing to render. Create a graph with at least a mesh, material and probably some light"
      );
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    ƒ.Debug.log("Viewport:", viewport);

    await loadSprites();

    viewport.draw();
    canvas.dispatchEvent(
      new CustomEvent("interactiveViewportStarted", {
        bubbles: true,
        detail: viewport,
      })
    );
  }

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(2.5, 2.5, 15));
    viewport.camera.mtxPivot.rotateY(180);

    const graph: ƒ.Node = viewport.getBranch();

    ƒ.AudioManager.default.listenTo(graph);

    sounds = graph
      .getChildrenByName("sound")[0]
      .getComponents(ƒ.ComponentAudio);

    pacman = graph.getChildrenByName("pacman")[0];
    walls = graph.getChildrenByName("grid")[0].getChild(1).getChildren();
    paths = graph.getChildrenByName("grid")[0].getChild(0).getChildren();
    ghost = createGhost();
    graph.addChild(ghost);

    setPacman(pacman);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    movePacman();

    if (checkForWall()) {
      if (!sounds[1].isPlaying && !speed.equals(ƒ.Vector3.ZERO())) {
        sounds[1].play(true);
      }
      pacman.mtxLocal.translate(speed);
    }
    viewport.draw();
  }

  function movePacman(): void {
    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_RIGHT,
        ƒ.KEYBOARD_CODE.D,
      ]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      if (checkForWall(Direction.Right)) {
        rotatePacman(Direction.Right, direction);
        speed.set(1 / 60, 0, 0);
        direction = Direction.Right;
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_DOWN,
        ƒ.KEYBOARD_CODE.S,
      ]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      if (checkForWall(Direction.Down)) {
        rotatePacman(Direction.Down, direction);
        speed.set(0, -1 / 60, 0);
        direction = Direction.Down;
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_LEFT,
        ƒ.KEYBOARD_CODE.A,
      ]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      if (checkForWall(Direction.Left)) {
        rotatePacman(Direction.Left, direction);
        speed.set(-1 / 60, 0, 0);
        direction = Direction.Left;
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      if (checkForWall(Direction.Up)) {
        rotatePacman(Direction.Up, direction);
        speed.set(0, 1 / 60, 0);
        direction = Direction.Up;
      }
    }
  }

  function checkForWall(_dir?: Direction): boolean {
    const y = pacman.mtxLocal.translation.y;
    const x = pacman.mtxLocal.translation.x;
    let newPos: ƒ.Vector3 = new ƒ.Vector3(500, 500, 500);

    switch (_dir ?? direction) {
      case Direction.Right:
        newPos = new ƒ.Vector3(x + 1, y, 0);
        break;
      case Direction.Left:
        newPos = new ƒ.Vector3(x - 1, y, 0);
        break;
      case Direction.Up:
        newPos = new ƒ.Vector3(x, y + 1, 0);
        break;
      case Direction.Down:
        newPos = new ƒ.Vector3(x, y - 1, 0);
        break;
      default:
        break;
    }

    if (walls.find((w) => w.mtxLocal.translation.equals(newPos, 0.022))) {
      sounds[1].play(false);
      return false;
    }

    if (!paths.find((p) => p.mtxLocal.translation.equals(newPos, 1))) {
      sounds[1].play(false);
      return false;
    }

    return true;
  }

  function createGhost() {
    let node: ƒ.Node = new ƒ.Node("Ghost");

    let mesh: ƒ.MeshSphere = new ƒ.MeshSphere();
    let material: ƒ.Material = new ƒ.Material("MaterialGhost", ƒ.ShaderLit, new ƒ.CoatColored());

    let cmpTransfrom: ƒ.ComponentTransform = new ƒ.ComponentTransform();
    let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);

    cmpMaterial.clrPrimary = ƒ.Color.CSS("red");

    node.addComponent(cmpMaterial);
    node.addComponent(cmpMesh);
    node.addComponent(cmpTransfrom);

    node.mtxLocal.translateX(2);
    cmpTransfrom.mtxLocal.translateY(1);

    return node;

  }
}
