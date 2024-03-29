import { 
    MessageType,
    ServerMessage,
    ClientMessage,
    removePlayer,
    handlePlayerInput,
    handleStateCorrection,
    StampedInput,
    refreshMap,
    setActorState,
    setPlayerMinerals,
    setCurrentPlayer,
    addPlayer
} from "core";

import { ClientSocket, CoreStore } from "../containers/GameWrapper";

let lastPing = 0;

export function handleMessage(message: ServerMessage): void {
    switch (message.type) {
        case MessageType.PONG:
            const ping = getTime() - lastPing;
            console.debug("ping", ping, getTime(), lastPing);
            sendLatencyUpdate(ping);
            return;
        case MessageType.INIT_PLAYER:
            setCurrentPlayer(CoreStore, message.payload.currentPlayerId);
            setActorState(CoreStore, message.payload.actorState);
            return;
        case MessageType.MAP_RESPONSE:
            refreshMap(CoreStore, message.payload);
            return;
        case MessageType.ADD_PLAYER:
            addPlayer(CoreStore, message.payload);
            return;
        case MessageType.REMOVE_PLAYER:
            removePlayer(CoreStore, message.payload);
            return;
        case MessageType.PLAYER_INPUT:
            handlePlayerInput(CoreStore, message.payload.playerId, message.payload.input);
            return;
        case MessageType.INVALID:
            console.error('sent an invalid message to server')
            return;
        case MessageType.STATE_CORRECTION:
            handleStateCorrection(CoreStore, message.payload);
            return;
        case MessageType.SET_PLAYER_MINERALS:
            Object.keys(message.payload).forEach(pId => {
                setPlayerMinerals(CoreStore, pId, message.payload[pId]);
            });
            return;
        default:
            console.error('recieved an invalid message type from server')
            return;
    }
}

export const pingServer = () => {
    const request: ClientMessage = { type: MessageType.PING }
    lastPing = getTime();
    trySend(JSON.stringify(request));
}

export const requestMap = () => {
    const request: ClientMessage = { type: MessageType.MAP_REQUEST }
    trySend(JSON.stringify(request));
}

export const sendPlayerInput = (playerId: string, input: StampedInput) => {
    const request: ClientMessage = { type: MessageType.PLAYER_INPUT, payload: { playerId, input } }
    trySend(JSON.stringify(request));
}

export const sendPerceptionUpdate = () => { 
    const timeStamp = (new Date()).getTime();
    const currentState = CoreStore.getState().actorState.actorDict
    let locationMap = {};
    Object.keys(currentState).forEach(playerId => {
        locationMap = {...locationMap, [playerId]: currentState[playerId].status.location }
    });
    const request: ClientMessage = { type: MessageType.CLIENT_PERCEPTION_UPDATE, payload: {locationMap, timeStamp } };
    trySend(JSON.stringify(request));
}

export const sendSimulatedLagInput = (lag: number) => {
    const request: ClientMessage = { type: MessageType.SET_SIMULATED_LAG, payload: lag };
    trySend(JSON.stringify(request));
}

const sendLatencyUpdate = (lag: number) => {
    const request: ClientMessage = { type: MessageType.LATENCY_UPDATE, payload: lag };
    trySend(JSON.stringify(request));
}

const trySend = (message: string) => {
    if (ClientSocket.readyState === 1) {
        ClientSocket.send(message);
        return true;
    }
    return false;
}

const getTime = () => (new Date()).getTime();