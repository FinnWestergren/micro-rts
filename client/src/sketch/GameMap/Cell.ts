import * as p5 from "p5";
import { MapStore } from "../../containers/GameWrapper";
import { CoordPair, Directions, DirectionsUtils } from "shared";

export default class Cell {
    public cellType: Directions;
    private gridCoords: CoordPair;
    private location: CoordPair;
    private halfSize: number;
    private cellSize: number;
    private up: boolean;
    private down: boolean;
    private left: boolean;
    private right: boolean;

    public constructor(cellType: Directions, x: number, y: number){
        this.cellType = cellType;
        this.gridCoords = {x, y};
        this.halfSize = MapStore.getState().cellDimensions.halfCellSize;
        this.cellSize = MapStore.getState().cellDimensions.cellSize;
        this.location = { x: (this.halfSize + x * this.cellSize), y: (this.halfSize + y * this.cellSize) };
        this.up = DirectionsUtils.isUp(cellType);
        this.down = DirectionsUtils.isDown(cellType);
        this.left = DirectionsUtils.isLeft(cellType);
        this.right = DirectionsUtils.isRight(cellType);
    }

    public draw: (p: p5) => void = (p) => {
        p.push();
        p.translate(this.location.x, this.location.y);
        // this.drawDebugLines(p);
        this.drawDebugText(p);
        this.drawWalls(p);
        p.pop();
    }

    private drawDebugText(p: p5){
        p.textAlign("center","center");
        p.text(`(${this.gridCoords.x}, ${this.gridCoords.y})`, 0, 0);
    }

    private drawDebugLines: (p: p5) => void = (p) => {
        p.stroke(0,255,0);
        if (this.up) {
            p.line(0, 0, 0, -this.halfSize);
        }
        if (this.down) {
            p.line(0, 0, 0, this.halfSize);
        }
        if (this.left) {
            p.line(0, 0, -this.halfSize, 0);
        }
        if (this.right) {
            p.line(0, 0, this.halfSize, 0);
        }
        p.stroke(0);
    }

    private drawWalls: (p: p5) => void = (p) => {
        if(!this.down){
            p.line(-this.halfSize, this.halfSize, this.halfSize, this.halfSize);
        }
        
        if(!this.up){
            p.line(-this.halfSize, -this.halfSize, this.halfSize, -this.halfSize);
        }
        
        if(!this.right){
            p.line(this.halfSize, -this.halfSize, this.halfSize, this.halfSize);
        }
        
        if(!this.left){
            p.line(-this.halfSize, -this.halfSize, -this.halfSize, this.halfSize);
        }
    }
}