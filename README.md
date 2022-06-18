# Mine sweeper

## The Tiki online test.

This is a web version of the lengend MineSweeper implementation in React and Pixi.js.

## Tech

This repo uses a number of open source projects to work properly:

- [ReactJS] - HTML enhanced for web apps!
- [Pixi.js] - The HTML5 Creation Engine.
- [Redux] - A Predictable State Container for JS Apps.
- [Jest] - A delightful JavaScript Testing Framework.
- [Webpack] - JS bundler.

And of course this game itself is fully written in Typescript.
In the next part, I will explain why I choose those libraies.

- ReactJS: Well, because I am applying to the ReactJS role. LOL
- Pixi.js: The minesweeper game will contain alot of tiles, and I don't want to put too many node in the real DOM instead we can achieve this just by using one canvas element. That's why I use this library for interact with the HTML5 canvas.
- Redux: I love it! I also use `thunk` in my setup. It helps us to reduce the boilerplates and also we can also get the exact state we want just by using one hook.
- Jest: This one is very popular, we can choose any libraries we want but I prefer Jest.
- Webpack: This one is very popular too, but the reason why I don't want to use CRA that was because I only want to use a very few plugins and CRA is like overkill to a project like this. That's why I decided to set it up from scratch.

## How it works

For the tiles grid, I have 1 two dimensions array. Each element in this array will hold a proper value for its kind.

- Mine = -1
- Empty = 0
- MinesAround = value > 0 `and` value <= 8

So, the next step is we will calculate how many mines surrounding a cell.
To do that we will iterate through the mines position array and for each mine in that array we will add 1 to every surrounding cell nearby. (top, right, bottom, left, top right, top left, bottom right, bottom left)

After getting the surround mines for every cell, we can render it on the canvas. In my codebase, I use 2 array to represent for tiles and mines grid.

- So if we click a mine then the game will stop.
- If we click a empty cell, mark it as visited and we will search other cells by using DFS and whenever we hit the first positive number cell then we will do the same thing like below step.
- If we click the number cell, mark it as visited and exit.

To identify when win or lose, I will use a count variable. This variables will be used to count how many valid cells left.
If it is 0 then you win the game, otherwise you have to keep playing.
