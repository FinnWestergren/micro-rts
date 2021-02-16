import p5 from "p5";
import { CoordPair, CoordPairUtils } from "core";
import { GameStore, MapStore } from "../containers/GameWrapper";
import { moveUnit } from "../utils/clientActions";

const KeyCodeOne = 49;
const KeyCodeTwo = 50;
const KeyCodeThree = 51;

export const bindHumanPlayer = (p: p5, playerId: string, selectActor: (actorId?: string) => void, selectedActor: () => string | undefined) => {
    const oneOverCellSize = 1 / MapStore.getState().cellDimensions.cellSize;
    const cells = MapStore.getState().mapCells;
    if (!cells || cells.length === 0) {
        return;
    }
    const max_y = cells.length, max_x = cells[0].length;
    const actors = GameStore.getState().actorOwnershipDict[playerId];

    const getClickedTile = (mouse: CoordPair) => {
        const element = document.getElementById("app-p5_container");
        if (!element) {
            return;
        }
        const xDest = Math.floor((mouse.x - element.offsetLeft + document.documentElement.scrollLeft) * oneOverCellSize);
        const yDest = Math.floor((mouse.y - element.offsetTop + document.documentElement.scrollTop) * oneOverCellSize);
        if (xDest >= 0 && yDest >= 0 && xDest < max_x && yDest < max_y) {
            return {x: xDest, y: yDest};
        }
    }

    p.keyPressed = () => {
        if (p.keyCode === KeyCodeOne && actors.length > 0) {
            selectActor(actors[0]);
        }
        if (p.keyCode === KeyCodeTwo && actors.length > 1) {
            selectActor(actors[1]);
        }
        if (p.keyCode === KeyCodeThree && actors.length > 2) {
            selectActor(actors[2]);
        }
    }

    p.mouseClicked = (e: any) => { 
        const mouse = {x: e.clientX, y: e.clientY} // can't use p.mouse because of scrolling / changing screen sizes
        const actorId = selectedActor();
        const clickedTile = getClickedTile(mouse);
        if (!clickedTile) {
            return;
        }
        if (p.keyIsDown(p.CONTROL) && actorId) {
            moveUnit(actorId, clickedTile);
        }
        else {
            selectActor(checkForActorInCell(clickedTile)?.id);
        }
    }
};

const checkForActorInCell = (tile: CoordPair) => {
    const actors = Object.values(GameStore.getState().actorDict)
    .filter(a => CoordPairUtils.equalPairs(tile, CoordPairUtils.snappedPair(a.status.location)));
    if (actors.length === 0) return;
    const ownedActors = actors.filter(a => a.ownerId === GameStore.getState().currentPlayer);
    return ownedActors[0] ?? actors[0];
    
}
