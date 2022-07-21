"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    CustomComponentScript.iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let Direction;
    (function (Direction) {
        Direction["Up"] = "UP";
        Direction["Down"] = "DOWN";
        Direction["Left"] = "LEFT";
        Direction["Right"] = "RIGHT";
    })(Direction = Script.Direction || (Script.Direction = {}));
    let dialog;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let viewport;
    let pacman;
    let ghost;
    let walls;
    let paths;
    let sounds;
    let direction;
    let speed = new ƒ.Vector3(0, 0, 0);
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            startInteractiveViewport();
        });
        // @ts-ignore
        dialog.showModal();
    }
    async function startInteractiveViewport() {
        // load resources referenced in the link-tag
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // pick the graph to show
        let graph = ƒ.Project.resources["Graph|2022-03-17T14:08:08.737Z|08207"];
        ƒ.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", viewport);
        await Script.loadSprites();
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {
            bubbles: true,
            detail: viewport,
        }));
    }
    function start(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.translate(new ƒ.Vector3(2.5, 2.5, 15));
        viewport.camera.mtxPivot.rotateY(180);
        const graph = viewport.getBranch();
        ƒ.AudioManager.default.listenTo(graph);
        sounds = graph
            .getChildrenByName("sound")[0]
            .getComponents(ƒ.ComponentAudio);
        pacman = graph.getChildrenByName("pacman")[0];
        walls = graph.getChildrenByName("grid")[0].getChild(1).getChildren();
        paths = graph.getChildrenByName("grid")[0].getChild(0).getChildren();
        ghost = createGhost();
        graph.addChild(ghost);
        Script.setPacman(pacman);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        movePacman();
        if (checkForWall()) {
            if (!sounds[1].isPlaying && !speed.equals(ƒ.Vector3.ZERO())) {
                sounds[1].play(true);
            }
            pacman.mtxLocal.translate(speed);
        }
        viewport.draw();
    }
    function movePacman() {
        if (ƒ.Keyboard.isPressedOne([
            ƒ.KEYBOARD_CODE.ARROW_RIGHT,
            ƒ.KEYBOARD_CODE.D,
        ]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkForWall(Direction.Right)) {
                Script.rotatePacman(Direction.Right, direction);
                speed.set(1 / 60, 0, 0);
                direction = Direction.Right;
            }
        }
        if (ƒ.Keyboard.isPressedOne([
            ƒ.KEYBOARD_CODE.ARROW_DOWN,
            ƒ.KEYBOARD_CODE.S,
        ]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkForWall(Direction.Down)) {
                Script.rotatePacman(Direction.Down, direction);
                speed.set(0, -1 / 60, 0);
                direction = Direction.Down;
            }
        }
        if (ƒ.Keyboard.isPressedOne([
            ƒ.KEYBOARD_CODE.ARROW_LEFT,
            ƒ.KEYBOARD_CODE.A,
        ]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkForWall(Direction.Left)) {
                Script.rotatePacman(Direction.Left, direction);
                speed.set(-1 / 60, 0, 0);
                direction = Direction.Left;
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkForWall(Direction.Up)) {
                Script.rotatePacman(Direction.Up, direction);
                speed.set(0, 1 / 60, 0);
                direction = Direction.Up;
            }
        }
    }
    function checkForWall(_dir) {
        const y = pacman.mtxLocal.translation.y;
        const x = pacman.mtxLocal.translation.x;
        let newPos = new ƒ.Vector3(500, 500, 500);
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
        let node = new ƒ.Node("Ghost");
        let mesh = new ƒ.MeshSphere();
        let material = new ƒ.Material("MaterialGhost", ƒ.ShaderLit, new ƒ.CoatColored());
        let cmpTransfrom = new ƒ.ComponentTransform();
        let cmpMesh = new ƒ.ComponentMesh(mesh);
        let cmpMaterial = new ƒ.ComponentMaterial(material);
        cmpMaterial.clrPrimary = ƒ.Color.CSS("red");
        node.addComponent(cmpMaterial);
        node.addComponent(cmpMesh);
        node.addComponent(cmpTransfrom);
        node.mtxLocal.translateX(2);
        cmpTransfrom.mtxLocal.translateY(1);
        return node;
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    const clrWhite = ƒ.Color.CSS("white");
    let animations;
    let spriteNode;
    async function setPacman(_node) {
        spriteNode = new ƒAid.NodeSprite("Sprite");
        spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spriteNode.setAnimation(animations["pacman"]);
        spriteNode.setFrameDirection(1);
        spriteNode.framerate = 10;
        spriteNode.mtxLocal.translateZ(0.5);
        spriteNode.mtxLocal.translateY(0.2);
        spriteNode.mtxLocal.translateX(0.1);
        _node.addChild(spriteNode);
    }
    Script.setPacman = setPacman;
    async function loadSprites() {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load("Sprites/pacmanRight.png");
        let spriteSheet = new ƒ.CoatTextured(clrWhite, imgSpriteSheet);
        generateSprites(spriteSheet);
    }
    Script.loadSprites = loadSprites;
    function generateSprites(_spritesheet) {
        animations = {};
        let name = "pacman";
        let sprite = new ƒAid.SpriteSheetAnimation(name, _spritesheet);
        sprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 46, 46), 4, 47, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(43));
        animations[name] = sprite;
    }
    function rotatePacman(_newDir, _dir) {
        switch (_dir) {
            case Script.Direction.Left:
                switch (_newDir) {
                    case Script.Direction.Right:
                        spriteNode.mtxLocal.rotateZ(180);
                        break;
                    case Script.Direction.Up:
                        spriteNode.mtxLocal.rotateZ(-90);
                        break;
                    case Script.Direction.Down:
                        spriteNode.mtxLocal.rotateZ(90);
                        break;
                    case Script.Direction.Left:
                        break;
                }
                break;
            case Script.Direction.Right:
                switch (_newDir) {
                    case Script.Direction.Right:
                        break;
                    case Script.Direction.Up:
                        spriteNode.mtxLocal.rotateZ(90);
                        break;
                    case Script.Direction.Down:
                        spriteNode.mtxLocal.rotateZ(-90);
                        break;
                    case Script.Direction.Left:
                        spriteNode.mtxLocal.rotateZ(180);
                        break;
                }
                break;
            case Script.Direction.Up:
                switch (_newDir) {
                    case Script.Direction.Right:
                        spriteNode.mtxLocal.rotateZ(-90);
                        break;
                    case Script.Direction.Up:
                        break;
                    case Script.Direction.Down:
                        spriteNode.mtxLocal.rotateZ(180);
                        break;
                    case Script.Direction.Left:
                        spriteNode.mtxLocal.rotateZ(90);
                        break;
                }
                break;
            case Script.Direction.Down:
                switch (_newDir) {
                    case Script.Direction.Right:
                        spriteNode.mtxLocal.rotateZ(90);
                        break;
                    case Script.Direction.Up:
                        spriteNode.mtxLocal.rotateZ(180);
                        break;
                    case Script.Direction.Down:
                        break;
                    case Script.Direction.Left:
                        spriteNode.mtxLocal.rotateZ(-90);
                        break;
                }
                break;
        }
    }
    Script.rotatePacman = rotatePacman;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map