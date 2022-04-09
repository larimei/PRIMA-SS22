declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    enum Direction {
        Up = "UP",
        Down = "DOWN",
        Left = "LEFT",
        Right = "RIGHT"
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    function setPacman(_node: ƒ.Node): Promise<void>;
    function loadSprites(): Promise<void>;
    function rotatePacman(_newDir: Direction, _dir: Direction): void;
}
