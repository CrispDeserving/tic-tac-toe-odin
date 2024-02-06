const Game = (() => {
	const board = [];
	const empty_cell = "_";

	function new_board() {
		board.splice(0, board.length);

		for (let i=0; i<3; i++) {
			const row = [];
			for (let j=0; j<3; j++) {
				row.push(empty_cell);
			}

			board.push(row);
		}

		return board;
	}

	return {
		board: new_board(),
	};
})();

window.addEventListener("DOMContentLoaded", () => {
	console.log(Game.board);
});
