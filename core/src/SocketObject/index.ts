import { Directions, StampedInput, CoordPair, ActorDict, ActorStatus } from "../Types"

export enum MessageType {
    INIT_PLAYER = "INIT_PLAYER",
    PING = "PING",
    PONG = "PONG",
    MAP_REQUEST = "MAP_REQUEST",
    MAP_RESPONSE = "MAP_RESPONSE",
    PLAYER_INPUT = "PLAYER_INPUT",
    ADD_PLAYER = "ADD_PLAYER",
    ADD_ACTOR = "ADD_ACTOR",
    REMOVE_PLAYER = "REMOVE_PLAYER",
    REMOVE_ACTOR = "REMOVE_ACTOR",
    INVALID = "INVALID",
    CLIENT_PERCEPTION_UPDATE = "CLIENT_PERCEPTION_UPDATE",
    STATE_OVERRIDE = "STATE_OVERRIDE",
    STATE_CORRECTION = "STATE_CORRECTION",
    SET_SIMULATED_LAG = "SET_SIMULATED_LAG",
    LATENCY_UPDATE = "LATENCY_UPDATE"
}

export type ClientMessage =
    { type: MessageType.PING } |
    { type: MessageType.MAP_REQUEST } |
    { type: MessageType.CLIENT_PERCEPTION_UPDATE, payload: { locationMap: { [playerId: string]: CoordPair }, timeStamp: number } } |
    { type: MessageType.PLAYER_INPUT, payload: { playerId: string; input: StampedInput } } |
    { type: MessageType.SET_SIMULATED_LAG, payload: number } |
    { type: MessageType.ADD_ACTOR, payload: string } |
    { type: MessageType.REMOVE_ACTOR, payload: string } |
    { type: MessageType.LATENCY_UPDATE, payload: number }

export type ServerMessage = 
    { type: MessageType.INIT_PLAYER, payload: { currentPlayerId: string, fullPlayerList: string[], actorStatusDict: ActorDict<ActorStatus> } }|
    { type: MessageType.ADD_PLAYER, payload: string } |
    { type: MessageType.ADD_ACTOR, payload: string } |
    { type: MessageType.REMOVE_PLAYER, payload: string } |
    { type: MessageType.REMOVE_ACTOR, payload: string } |
    { type: MessageType.PONG } |
    { type: MessageType.MAP_RESPONSE, payload: MapResponse } |
    { type: MessageType.INVALID } |
    { type: MessageType.STATE_OVERRIDE, payload: ActorDict<ActorStatus> } |
    { type: MessageType.STATE_CORRECTION, payload: { soft:  ActorDict<CoordPair>, hard: ActorDict<ActorStatus> } } |
    { type: MessageType.PLAYER_INPUT, payload: { playerId: string; input: StampedInput } }

export type MapResponse = Directions[][];
