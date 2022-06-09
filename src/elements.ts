import $ from 'jquery';
import { Player } from './types';

// Shared element selectors
export default {
  grid: $('#game') as JQuery<HTMLUListElement>,
  cells: $('#game .game-grid-cell') as JQuery<HTMLLIElement>,
  cell: {} as Record<`cell-${number}`, JQuery<HTMLLIElement>>,
  spans: {
    [`${Player.x}Win`]: $(`#${Player.x}-win`),
    [`${Player.o}Win`]: $(`#${Player.o}-win`),
    [`${Player.x}Plural`]: $(`.${Player.x}.plural`),
    [`${Player.o}Plural`]: $(`.${Player.o}.plural`),
  } as Record<string, JQuery<HTMLSpanElement>>,
  reset: $('.reset') as JQuery<HTMLButtonElement>,
  setGridButton: $('#set-grid-button') as JQuery<HTMLButtonElement>,
  turnDisplay: $('.whose-turn.disabled.btn') as JQuery<HTMLDivElement>,
  turnToken: $(
    '.whose-turn.disabled.btn > .player-token'
  ) as JQuery<HTMLDivElement>,
};
