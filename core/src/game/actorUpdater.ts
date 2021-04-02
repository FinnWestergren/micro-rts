import { store, CELLS_PER_MILLISECOND } from '.';
import { ActorStatus } from '../types/actor';
import { Direction, CoordPair, CoordPairUtils, DirectionUtils } from '../types';
import { updateActorStatus } from '../ducks/actorState';
import { getAverageFrameLength } from './frameManager';
import { getActorPath } from '../selectors/actorSelectors';

const idleStatus = (location: CoordPair) => {
    return {
        location: CoordPairUtils.roundedPair(location), // snap to grid
        direction: Direction.NONE
    }
};

export const updateActors = () => Object.keys(store.getState().actorState.actorDict).forEach(actorId => {
    const status = store.getState().actorState.actorDict[actorId].status;
    const path = checkCurrentPathStatus(status, getActorPath(store.getState(), actorId).path); 
    const newStatus = moveActorAlongPath(CELLS_PER_MILLISECOND * getAverageFrameLength(), path, status);
    if (status.destination && !CoordPairUtils.equalPairs(newStatus.location, status.location) ) {
        updateActorStatus(store, actorId, newStatus);
        return;
    }
    if (!path && status && status.direction !== Direction.NONE) {
        updateActorStatus(store, actorId, idleStatus(status.location));
    }
});

export const moveActorAlongPath: (dist: number, path: CoordPair[], status: ActorStatus) => ActorStatus = (dist, path, status) => {
    if (dist === 0) return status;
    if (path.length === 0) return idleStatus(status.location);
    
    let nextLocation = CoordPairUtils.snappedPair(status.location);
    let nextDirection = status.direction;
    let remainingDist = dist;
    for (let pathIndex = 0; pathIndex < path.length; pathIndex++) {
        const targetCell = path[pathIndex];
        nextDirection = CoordPairUtils.getDirection(nextLocation, targetCell)
        const distToCell = Math.sqrt(CoordPairUtils.distSquared(nextLocation, targetCell));
        if (remainingDist > distToCell) {
            nextLocation = { ...targetCell };
            continue;
        }
        switch (nextDirection) {
            case Direction.DOWN:
                nextLocation.y += remainingDist;
                break;
            case Direction.UP:
                nextLocation.y -= remainingDist;
                break;
            case Direction.RIGHT:
                nextLocation.x += remainingDist;
                break;
            case Direction.LEFT:
                nextLocation.x -= remainingDist;
                break;
        }
        break;
    }
    return { ...status, location: nextLocation, direction: nextDirection };
}

const checkCurrentPathStatus = (status: ActorStatus, path: CoordPair[]) => {
    let out = [...path]
    for(let i = 0; i < path.length - 1; i++) {
        const firstDir = CoordPairUtils.getDirection(CoordPairUtils.snappedPair(status.location), path[i]);
        const secondDir = CoordPairUtils.getDirection(CoordPairUtils.snappedPair(status.location), path[i + 1]);
        if (DirectionUtils.getOpposite(firstDir) === secondDir) {
            out = out.slice(1);
            break;
        }
    }
    return out;
}
