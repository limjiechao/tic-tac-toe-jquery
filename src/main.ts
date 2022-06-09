import './style.css';
import $ from 'jquery';
import elements from './elements';
import game from './game';
import { Guard } from './utils';

// Orchestrate game progresion
const handlePreTurnChecks = (cellElement: HTMLLIElement) => {
  // Guard against any completed game whether with a winner or a tie
  if (game.currentPlayerHasWon || game.completedAllTurns) {
    alert('Previous game has ended.\n\nStarting a new game!');
    game.reset();
    throw new Guard('Previous game has ended');
  }

  // Guard against pressing any cell which has already been played
  if ($(cellElement).hasClass('already-selected')) {
    alert('Cell is already selected');
    throw new Guard('Cell already selected');
  }

  // Guard against pressing any cell just before current game completes
  if ($(cellElement).hasClass('reject-pressing')) {
    alert('This game is over!');
    throw new Guard('Current game is over');
  }
};

const handleTurnOfPlay = (cellElement: HTMLLIElement) => {
  game.renderWhoseTurnToPlay();
  game.startNextTurn();
  game.renderTurnOfPlayForCurrentPlayer(cellElement);
};

const handlePostTurnChecks = async () => {
  // Check if current play has won
  if (game.currentPlayerHasWon) {
    game.updateWinsForCurrentPlayer();
    game.renderTimeOrTimesForCurrentPlayer();
    game.renderWinsForCurrentPlayer();

    await game.rejectPressingAndAlertPlayers(
      `Player ${game.currentPlayer.toUpperCase()} wins!`
    );
  }

  // Check if current game is a tie
  if (
    !game.previousPlayerHasWon &&
    !game.previousPlayerHasWon &&
    game.completedAllTurns
  ) {
    await game.rejectPressingAndAlertPlayers("That was tough! It's a tie!");
  }
};

// Add event handlers to event listeners
const listenAndHandleGridCellClick = () => {
  elements.cells.on('click', async function () {
    try {
      handlePreTurnChecks(this);

      handleTurnOfPlay(this);

      await handlePostTurnChecks();
    } catch (guard) {
      console.warn(`${(guard as Guard).name}: ${(guard as Guard).message}`);
    }
  });
};

const listenAndHandleResetButtonClick = () => {
  elements.reset.on('click', () => {
    game.reset();
  });
};

const listenAndHandleSetGridButtonClick = () => {
  elements.setGridButton.on('click', () => {
    game.reset();
    game.initializeGrid();
    listenAndHandleGridCellClick();
  });
};

// Initialization on document ready
$(function () {
  game.initializeGrid();
  listenAndHandleGridCellClick();

  listenAndHandleResetButtonClick();
  listenAndHandleSetGridButtonClick();
});
