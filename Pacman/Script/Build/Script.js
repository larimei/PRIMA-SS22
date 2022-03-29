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
        Direction["None"] = "NONE";
        Direction["Up"] = "UP";
        Direction["Down"] = "DOWN";
        Direction["Left"] = "LEFT";
        Direction["Right"] = "RIGHT";
    })(Direction || (Direction = {}));
    let viewport;
    let pacman;
    let speed = new ƒ.Vector3(0, 0, 0);
    let direction = Direction.None;
    let newDirection = Direction.None;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        let graph = viewport.getBranch();
        pacman = graph.getChildrenByName("pacman")[0];
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function outOfPlayground(dir) {
        switch (dir) {
            case "LEFT":
                if (pacman.mtxLocal.translation.x <= 0) {
                    return true;
                }
                else {
                    return false;
                }
            case "RIGHT":
                if (pacman.mtxLocal.translation.x >= 4) {
                    return true;
                }
                else {
                    return false;
                }
            case "UP":
                if (pacman.mtxLocal.translation.y >= 4) {
                    return true;
                }
                else {
                    return false;
                }
            case "DOWN":
                if (pacman.mtxLocal.translation.y <= 0) {
                    return true;
                }
                else {
                    return false;
                }
            default:
                return false;
        }
    }
    function checkDirectionection() {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])) {
            newDirection = Direction.Left;
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D])) {
            newDirection = Direction.Right;
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])) {
            newDirection = Direction.Up;
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])) {
            newDirection = Direction.Down;
        }
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        checkDirectionection();
        if (newDirection == "RIGHT" &&
            pacman.mtxLocal.translation.y % 1 < 0.05 &&
            outOfPlayground(newDirection) == false) {
            direction = Direction.Right;
            speed = new ƒ.Vector3(1 / 60, 0, 0);
        }
        if (newDirection == "LEFT" &&
            pacman.mtxLocal.translation.y % 1 < 0.05 &&
            outOfPlayground(newDirection) == false) {
            direction = Direction.Left;
            speed = new ƒ.Vector3(-1 / 60, 0, 0);
        }
        if (newDirection == "UP" &&
            pacman.mtxLocal.translation.x % 1 < 0.05 &&
            outOfPlayground(newDirection) == false) {
            direction = Direction.Up;
            speed = new ƒ.Vector3(0, 1 / 60, 0);
        }
        if (newDirection == "DOWN" &&
            pacman.mtxLocal.translation.x % 1 < 0.05 &&
            outOfPlayground(newDirection) == false) {
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
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map