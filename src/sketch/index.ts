import * as p5 from "p5";
import Game from "./Game";
import { updateAppDimensions, refreshMap } from "../ducks/mapState";
import { GlobalStore } from "../containers/GameWrapper";
import { Player } from "./Player/Player";
import { RandomAi } from "./Player/RandomAI";
import Directions from "./GameMap/Direction";

export default function sketch(p: p5): void {
	let game: Game;

	p.setup = function (): void {
		// @ts-ignore
		GlobalStore.dispatch(updateAppDimensions(600, 600));
		const {canvasHeight, canvasWidth} = GlobalStore.getState().mapState.appDimensions;
		p.createCanvas(canvasWidth, canvasHeight);
		game = new Game(p);
	};

	p.draw = function (): void {
		p.background(255);
		game.draw(p);
		game.update(p.frameCount);
	};
}