import $ from 'jquery';
import elements from './elements';
import { Player, PlayerCssClass } from './types';
import { Combinations, populateGridAndElementSelectors } from './grid.helpers';
import { delay } from './utils';

// Core game state and logic
export default {
  _turns: 0 as number,
  _wins: {
    x: 0,
    o: 0,
  } as Record<Player, number>,
  _winningCombinations: [] as Combinations,
  get winningCombinations(): Combinations {
    return this._winningCombinations;
  },
  set winningCombinations(combinations: Combinations) {
    this._winningCombinations = combinations;
  },
  get _isOTurn(): boolean {
    return this._turns % 2 === 0;
  },
  get currentPlayer(): Player {
    return this._isOTurn ? Player.o : Player.x;
  },
  get currentPlayerHasWon(): boolean {
    return this._checkIfPlayerHasWon(this.currentPlayer);
  },
  get currentPlayerWins(): number {
    return this._wins[this.currentPlayer];
  },
  get previousPlayer(): Player {
    return this._isOTurn ? Player.x : Player.o;
  },
  get previousPlayerHasWon(): boolean {
    return this._checkIfPlayerHasWon(this.previousPlayer);
  },
  get completedAllTurns(): boolean {
    return this._turns === elements.cells.length;
  },
  _checkIfPlayerHasWon(player: Player): boolean {
    return this.winningCombinations.some((winningCombination) =>
      winningCombination.every((gridCellNumber) =>
        elements.cell[`cell-${gridCellNumber}`].hasClass(player)
      )
    );
  },
  // Initialization
  _resetRounds(): void {
    this._turns = 0;
  },
  _resetGrid(): void {
    elements.cells.text('+');
    elements.cells.removeClass('already-selected');
    elements.cells.removeClass('reject-pressing');
    elements.cells.removeClass('o');
    elements.cells.removeClass('x');
    elements.cells.removeClass(PlayerCssClass.x);
    elements.cells.removeClass(PlayerCssClass.o);
  },
  _resetTurn(): void {
    elements.turnDisplay.removeClass(PlayerCssClass[this.currentPlayer]);
    elements.turnDisplay.addClass(PlayerCssClass[this.previousPlayer]);
    elements.turnToken.text(this.previousPlayer.toUpperCase());
  },
  reset(): void {
    this._resetGrid();
    this._resetRounds();
    this._resetTurn();
  },
  initializeGrid(): void {
    const requestedGridSize = Number(
      window.prompt('Enter grid size (minimum: 3)', '3') ?? '3'
    );
    const gridSize = requestedGridSize >= 3 ? requestedGridSize : 3;

    elements.grid.css('grid-template-rows', `repeat(${gridSize}, 1fr)`);
    elements.grid.css('grid-template-columns', `repeat(${gridSize}, 1fr)`);

    populateGridAndElementSelectors(gridSize);
  },
  // Handle turn of play
  renderWhoseTurnToPlay(): void {
    elements.turnDisplay.removeClass(PlayerCssClass[this.previousPlayer]);
    elements.turnDisplay.addClass(PlayerCssClass[this.currentPlayer]);
    elements.turnToken.text(this.currentPlayer.toUpperCase());
  },
  startNextTurn(): void {
    this._turns++;
  },
  renderTurnOfPlayForCurrentPlayer(cellElement: HTMLLIElement): void {
    $(cellElement).text(this.currentPlayer);
    $(cellElement).addClass(
      `already-selected ${this.currentPlayer} ${
        PlayerCssClass[this.currentPlayer]
      }`
    );
  },
  // Handle post turn checks
  updateWinsForCurrentPlayer(): void {
    this._wins[this.currentPlayer]++;
  },
  renderTimeOrTimesForCurrentPlayer(): void {
    if (this.currentPlayerWins === 1) {
      elements.spans[`${this.currentPlayer}Plural`].css('display', 'none');
    } else {
      elements.spans[`${this.currentPlayer}Plural`].css('display', '');
    }
  },
  renderWinsForCurrentPlayer(): void {
    elements.spans[`${this.currentPlayer}Win`].text(this.currentPlayerWins);
  },
  async rejectPressingAndAlertPlayers(message: string) {
    elements.cells.addClass('reject-pressing');
    await delay(100);
    alert(message);
  },
};
