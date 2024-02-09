const GameState = (() => {
	const CELL_STATES = {
		empty_cell: "_",
		x_mark: "x",
		o_mark: "o",
	};
	let move;
	
	return {
		CELL_STATES,
		board: [],

		get current_move() {
			return move;
		},

		set current_move(value) {
			for (const valid_state in CELL_STATES) {
				if (CELL_STATES[valid_state] === value) {
					move = value;
					return;
				}
			}

			console.error("(set current_move): Not a valid change.");
		},
	};
})();

const Game = ((import_state) => {
	let { board, CELL_STATES } = import_state;

	function reset_board() {
		board.splice(0, board.length);

		for (let i=0; i<3; i++) {
			const row = [];
			for (let j=0; j<3; j++) {
				row.push(CELL_STATES.empty_cell);
			}

			board.push(row);
		}
	}

	function new_game() {
		import_state.current_move = CELL_STATES.o_mark;
		reset_board();
	}

	return {
		new_game,
	};
})(GameState);

// Game todo:
// Board (dictates player state)
// BoardDisplay
// Player -> create_move -> update_board -> result (win or continue)
// PlayerDisplay

window.addEventListener("DOMContentLoaded", () => {
	Game.new_game();

	console.table(GameState.board);
	console.log(GameState.current_move);
});
