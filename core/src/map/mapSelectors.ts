import { createSelector } from 'reselect'
import { CoordPair, Direction, MapState } from '../types'
import { preProcessMap } from './mapProcessing'

const allCellsSelector = (state: MapState) => state.mapCells;

export const junctionSelector = createSelector(
    allCellsSelector,
    preProcessMap
);