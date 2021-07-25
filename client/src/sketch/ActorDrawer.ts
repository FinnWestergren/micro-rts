import { Actor, ActorType } from "core";
import p5 from "p5";
import { Store } from "../containers/GameWrapper";

const CHAMP_SIZE = 0.7;
const MINER_SIZE = 0.4;

export const drawActor = (p: p5, actor: Actor, isSelected: boolean) => {
    const location = actor.status.location;
    const cellSize = Store.getState().mapState.cellDimensions.cellSize;
    const IDcolor = p.color(`#${actor.ownerId.substr(0, 6)}`);
    const isFriendly = actor.ownerId === Store.getState().playerState.currentPlayer;
    const factionColor = isFriendly ? p.color('#edf5f7') : p.color('#cc5b47')

    const drawMethod = getDrawMethod(p, actor.type, cellSize);

    p.push();
    p.translate((location.x + 0.5) * cellSize, (location.y + 0.65) * cellSize);
    p.angleMode(p.DEGREES);
    p.rotate(Math.log2(actor.status.orientation) * 90); // *chefs kiss*
    p.noFill();
    p.strokeWeight(isSelected ? 4 : 3);
    p.stroke(factionColor);
    drawMethod();
    p.strokeWeight(isSelected ? 2 : 1);
    p.stroke(IDcolor);
    if (isSelected) {
        p.fill(factionColor);
    }
    drawMethod();
    p.pop();
};

const getDrawMethod = (p: p5, actorType: ActorType, cellSize: number) => {
    switch(actorType) {
        case ActorType.CHAMPION:
            return () => drawYWing(p, cellSize * CHAMP_SIZE);
        case ActorType.MINER:
            return () => drawYWing(p, cellSize * MINER_SIZE);
    }
}

const drawYWing = (p: p5, actorSize: number) => {
    p.beginShape(p.QUADS);
    p.vertex(0, -actorSize * 0.5); // tip
    p.vertex(actorSize * 0.3, actorSize * 0.3); // rightwing
    p.vertex(0, 0); // nut
    p.vertex(-actorSize * 0.3, actorSize * 0.3); //leftwing
    p.endShape(p.CLOSE);
}