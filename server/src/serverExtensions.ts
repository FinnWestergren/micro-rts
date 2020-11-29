import { ClientMessage, MessageType, ServerMessage, MapResponse, refreshMap, CoordPair, SPEED_FACTOR, UPDATE_FREQUENCY, PlayerStatusMap, Directions, handlePlayerInput } from "shared";
import { generateMapUsingRandomDFS } from "./mapGenerator";
import { MapStore, PlayerStore, writeToSinglePlayer, writeToAllPlayers } from ".";

const potentialDriftFactor = SPEED_FACTOR * 2 * UPDATE_FREQUENCY; // multiply by two since they could be going the opposite direction by now.
const smoothOverrideTriggerDist = 0.02;
const snapOverrideTriggerDist = 0.30;

export const handleMessage = (message: ClientMessage, fromPlayer: string) => {
	switch (message.type) {
		case MessageType.PING:
			writeToSinglePlayer({ 
				type: MessageType.PONG, 
				payload: (new Date()).getTime() - message.payload.time
			}, fromPlayer);
			return;
		case MessageType.MAP_REQUEST:
			writeToSinglePlayer({ 
				type: MessageType.MAP_RESPONSE, 
				payload: getCurrentMap() 
			}, fromPlayer);
			return;
		case MessageType.PLAYER_INPUT:
			handlePlayerInput(PlayerStore, fromPlayer, message.payload.input)
			writeToAllPlayers(message, 0, fromPlayer);
			return;
		case MessageType.CLIENT_PERCEPTION_UPDATE:
			const perceptionUpdate = getPerceptionUpdate(message.payload.locationMap, message.payload.timeStamp);
			if (perceptionUpdate) {
				writeToSinglePlayer(perceptionUpdate, fromPlayer);
			}
			return;
		default:
			writeToSinglePlayer({ type: MessageType.INVALID, payload: null }, fromPlayer);
	}
}

export const getCurrentMap: () => MapResponse = () => {
	if (MapStore.getState().mapCells.length === 0) {
		const newMap = generateMapUsingRandomDFS();
		// @ts-ignore
		MapStore.dispatch(refreshMap(newMap));
		return newMap;
	}
	return MapStore.getState().mapCells;
};

const getPerceptionUpdate:(locationMap: {[playerId: string]: CoordPair}, timeStamp: number) => ServerMessage | null = (locationMap, timeStamp) => {
	const potentialDrift = Math.abs(((new Date()).getTime() - timeStamp) * potentialDriftFactor);
	const snapOverrideSquared = Math.pow(snapOverrideTriggerDist + potentialDrift, 2);
	const smoothOverrideSquared = Math.pow(smoothOverrideTriggerDist + potentialDrift, 2);
	let correctionMap: PlayerStatusMap = {};
	const fullMap = PlayerStore.getState().playerStatusMap;
	Object.keys(locationMap).filter(pId => !!fullMap[pId]).forEach(pId => {
		const serverPerception = fullMap[pId].location;
		const clientPerception = locationMap[pId];
		const distSquared = perceptionDifferenceSquared(serverPerception, clientPerception);
		if (distSquared > snapOverrideSquared) {
			correctionMap[pId] = fullMap[pId];
		}
		else if (distSquared > smoothOverrideSquared) {
			correctionMap[pId] = { ...fullMap[pId], location: interpolate(serverPerception, clientPerception, fullMap[pId].direction)}
		}
	});
	if (Object.keys(correctionMap).length > 0) {
		return { type: MessageType.STATE_CORRECTION, payload: correctionMap };
	}
	return null;
}

const perceptionDifferenceSquared = (serverPerception: CoordPair, clientPerception: CoordPair ) => {
	const xDiff = Math.abs(clientPerception.x - serverPerception.x);
	const yDiff = Math.abs(clientPerception.y - serverPerception.y);
	return Math.pow(xDiff, 2) + Math.pow(yDiff, 2)
}

const interpolate: (serverPerception: CoordPair, clientPerception: CoordPair, direction: Directions) => CoordPair = (serverPerception, clientPerception, direction) => {
	const average = { x: (serverPerception.x + clientPerception.x) * 0.5, y: (serverPerception.y + clientPerception.y) * 0.5 }
	const roundedAvg = {x: Math.round(average.x), y: Math.round(average.y)}
	// snap to grid logic
	if (direction === Directions.NONE) {
		return roundedAvg;
	}
	if (direction === Directions.UP || direction === Directions.DOWN) {
		return { y: average.y, x: roundedAvg.x };
	}
	return { x: average.x, y: roundedAvg.y };
}