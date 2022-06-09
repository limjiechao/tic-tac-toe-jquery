import $ from 'jquery';
import elements from './elements';
import game from './game';

type Grid = number[];
type Combination = number[];
export type Combinations = Combination[];

const enumerateGridCellNumbers = (rowCount: number, colCount: number): Grid =>
  Array(rowCount * colCount)
    .fill(undefined)
    .map((_, index) => index + 1);

const enumerateSquareGridCellNumbers = (length: number): Grid =>
  enumerateGridCellNumbers(length, length);

// Next cell in the row: + L - 1
const getUpwardSlopingDiagonalRow = (size: number) => {
  const firstRowLastCellNumber = size;
  const cellsInARow = size;

  return Array(cellsInARow)
    .fill(firstRowLastCellNumber)
    .map(
      (firstRowLastCellNumber, index) =>
        firstRowLastCellNumber + (firstRowLastCellNumber - 1) * index
    );
};

// Next cell in the row: + L + 1
const getDownwardSlopingDiagonalRow = (size: number): Combination => {
  const firstRowFirstCellNumber = 1;
  const cellsInARow = size;

  return Array(cellsInARow)
    .fill(firstRowFirstCellNumber)
    .map(
      (firstRowFirstCellNumber, index) =>
        firstRowFirstCellNumber + (cellsInARow + 1) * index
    );
};

// Next cell in the row: + L + L
const getVerticalRows = (size: number): Combinations => {
  const firstRowFirstCellNumber = 1;
  const cellsInARow = size;

  return Array(cellsInARow)
    .fill(firstRowFirstCellNumber)
    .map((firstRowFirstCellNumber, index) =>
      Array(cellsInARow)
        .fill(firstRowFirstCellNumber + firstRowFirstCellNumber * index)
        .map((cell, index) => cell + cellsInARow * index)
    );
};

// Next cell in the row: + 1
const getHorizontalRows = (size: number): Combinations => {
  const firstRowFirstCellNumber = 1;
  const cellsInARow = size;

  return Array(cellsInARow)
    .fill(firstRowFirstCellNumber)
    .map((firstRowFirstCellNumber, index) =>
      Array(cellsInARow)
        .fill(firstRowFirstCellNumber + cellsInARow * index)
        .map((cell, index) => cell + 1 * index)
    );
};

const getAllWinningCombinations = (size: number): Combinations => [
  getDownwardSlopingDiagonalRow(size),
  getUpwardSlopingDiagonalRow(size),
  ...getHorizontalRows(size),
  ...getVerticalRows(size),
];

export const populateGridAndElementSelectors = (size: number) => {
  const gridCellNumbers = enumerateSquareGridCellNumbers(size);

  // Create grid cells
  const gridCells = gridCellNumbers.map((cellNumber) => {
    const cell = $(`<li>`);
    cell.attr('data-cell-number', cellNumber);
    cell.attr('class', 'game-grid-cell btn');
    cell.text('+');

    return cell;
  });

  // Empty grid and populate with new grid cells
  elements.grid.empty();
  elements.grid.append(gridCells);

  // Add selector for newly created grid cells
  elements.cell = Object.fromEntries(
    gridCellNumbers.map((gridCellNumber) => [
      `cell-${gridCellNumber}`,
      $(`li[data-cell-number="${gridCellNumber}"`),
    ])
  );
  // Refresh stale selector after populating grid
  elements.cells = $('#game .game-grid-cell');

  // Set winning combinations for checking
  game.winningCombinations = getAllWinningCombinations(size);
};
