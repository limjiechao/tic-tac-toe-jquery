# General Considerations

## Goodbye SPA, Hello `jQuery`

No reactive SPA framework was used. The approach here is not to rush into the latest and shiniest technology but consider what a suitable solution would be for the problem.

> *I suppose it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail.*
>
> Abraham H. Maslow

## Reasons
 
Firstly, Tic Tac Toe game is *already* a simple, single-page application. SPAs can help in rendering, routing and state management of very complex apps that needs to behave *as if* it is single-page. Moreover, the last two points are irrelevant a game with one view and a very simple user-event-driven state (turns wins in an object literal and state of play in the DOM).

Secondly, to help only in rendering the UI is admittedly not much better for Tic Tac Toe, where the most complexity lies in the game flow, rules, and the pre- and post-turn checks required to prevent the game from falling into invalid states.

This was how I came to the conclusion to focus simply on improving the game logic and retain `jQuery`.

## Miscellaneous

`jQuery` was upgraded to v3.6.0.

TypeScript was introduced to provide self-documentation, static typing and type checking at compile time to prevent most footguns.

# Improvements

## Reorganized logic

The code is reorganized into two levels of abstractions.

### Top level abstraction: orchestration logic

At the topmost level, the game is abstracted into three phases.

```typescript
try {
  handlePreTurnChecks(this); // phase 1

  handleTurnOfPlay(this); // phase 2

  await handlePostTurnChecks(); // phase 3
} catch (guard) {
  console.warn(`${(guard as Guard).name}: ${(guard as Guard).message}`);
}
```

Notice that these three phases are wrapped in a `try…catch`. This pattern was adopted specifically to break up the long chain of `if…else` statements which makes it hard to extend or debug the game.

Before and after the actual turn of play, the game runs through a number of *guards* that prevents the game from moving to the next phase if conditions leading into invalid game states are found. A guard will be thrown and caught at the topmost level.

This pattern ensures that the game will never progress when it should not *without* a long chain of `if…else` statements.

This is an example of a guard:

```typescript
// Guard against any completed game whether with a winner or a tie
if (game.currentPlayerHasWon || game.completedAllTurns) {
  game.reset();
  game.alertAndGuard(
    'Previous game has ended.\n\nStarting a new game!',
    'Previous game has ended'
  );
}
```

### Second level abstraction: object-oriented pattern for core game logic

Core game logic is reorganized into a game object with:

- underlying states denoted with `_`
- getters and setters for underlying states
- private methods only called by public methods are denoted with `_`
- public methods that
  - interact and mutate the underlying states, and
  - handles the rendering

Every method and property is given a descriptive name to promote indirection. By reading the name, there should not be a need to delve into the code to understand what it is doing. 

```typescript
const handleTurnOfPlay = (cellElement: HTMLLIElement) => {
  game.renderWhoseTurnToPlay();
  game.startNextTurn();
  game.renderTurnOfPlayForCurrentPlayer(cellElement);
};
```

The public methods allow the code to be D.R.Y. and at the same time, the methods names informs what is going on in simple English phrases.

## Scalable game grid

### Reconfiguration grid size

The game grid's size is now configurable upon launch and reconfigurable at all times.

This is made possible by:

- dynamically generating the grid from user input instead of hard-coding it to a 3-by-3 grid in HTML.
- refactoring the hard-coded possible combinations for winning in the checking logic by regenerating the possible combinations every time a new grid size is set.

### Grid cell generation

To facilitate dynamic generation of the possible winning combinations, the grid cells are numbered as follows:

| Row/Column | 1  | 2  | 3  | 4  |
|------------|----|----|----|----|
|          1 |  1 |  2 |  3 |  4 |
|          2 |  5 |  6 |  7 |  8 |
|          3 |  9 | 10 | 11 | 12 |
|          4 | 13 | 14 | 15 | 16 |

This creates the following mathematical relationships, where `C` is the current cell number and `L` is size of grid:

- Diagonally from top right to bottom left 
  - Next cell number down the column: `C + L - 1`
- Diagonally from top left to bottom right
  - Next cell number up the column: `C + L + 1`
- Vertical down
  - Next cell number down the column: `C + L`
- Horizontal across
  - Next cell number in the row: `C + 1`

The grid number is set as [`data-*` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*) on the grid cell's `<li>` element in the DOM. This makes cell selection easy with:

```typescript
$(`li[data-cell-number="${gridCellNumber}"`)
```

### Grid rendering

CSS grid is used to render the game grid.

```css
.game-grid {
  display: grid;
  aspect-ratio: 1 / 1;
  gap: 1rem;
  /* ... */
}

.game-grid .game-grid-cell {
  aspect-ratio: 1 / 1;
  height: 3.75rem;
  /* ... */
}
```

The number of rows and columns are dynamically set as inline styles.

```html
<ul
  id="game"
  class="game-grid"
  style="
    grid-template-rows: repeat(3, 1fr);
    grid-template-columns: repeat(3, 1fr);
  "
>
  <!-- ... --->
</ul>
```

## Gameplay Experience

### Game grid is scrollable for large grid size

While not objectively a pleasant experience, players can now play a large grid should they so choose.

The size of each grid cell was not reduced as it felt like a pleasant size for tapping on smartphones, while space constraint is less of a concern in bigger screen sizes.

### Turn indicator

To make it obvious which player's turn it is currently, the indicator is deliberately styled in the current player's color and token.

### Check for tie immediately after turn of play

Instead of checking for tie just before the next player makes a play, right after the current player's turn, the game will check for win *and* tie. Should a tie arise, the players are immediately alerted.

### Deliberate 300ms delay before showing alert

Where needed, a deliberate 300ms delay is introduced to allow the game to render the last winning or tie move before the alert is shown.  

### Narrow screen accommodation

For screen widths below `414px`, the turn indicator and restart button is wrapped below the score indicator and above the game grid. The is done via:

```css
@media screen and (max-width: 413px) {
  /* ... */
}
```

### Improved light mode

Game background is now alice blue instead of white to reduce harshness on the eyes. 

### Dark mode

Game background is set to dark grey and the grid cells have been subtly tweaked to reduce harshness but continue to look substantially similar to its light mode counterpart. This is done via:

```css
@media screen and (prefers-color-scheme: dark) {
  /* ... */
}
```

## One-off initialization of jQuery selectors

To save unnecessary computation and code duplication, all needed jQuery selectors are initialized and stored in `elements` module that is loaded ahead of game logic initialization and event listeners additions.

Grid cell selectors are refreshed each time the grid is generated dynamically. 

## Refactored stylesheet

- Except for Bootstrap class names, custom class names are a lot more descriptive
- Styles have been reorganized such that the arrangement follows the general order of where they are found in the HTML.
- narrow screen accommodations are handled just after the corresponding light mode styles.
- dark mode is handled last in the stylesheet to override the light mode styles.
