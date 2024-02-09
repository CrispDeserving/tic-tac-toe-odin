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
			for (const valid_state of [CELL_STATES.o_mark, CELL_STATES.x_mark]) {
				if (valid_state === value) {
					move = value;
					return;
				}
			}

			console.error("(set current_move): Not a valid change.");
		},
	};
})();

const Game = ((import_state) => {
	const { board, CELL_STATES } = import_state;
	const { empty_cell, x_mark, o_mark } = CELL_STATES;

	function reset_board() {
		board.splice(0, board.length);

		for (let i=0; i<3; i++) {
			const row = [];
			for (let j=0; j<3; j++) {
				row.push(empty_cell);
			}

			board.push(row);
		}
	}

	function new_game() {
		import_state.current_move = o_mark;
		reset_board();
	}

	function finish_turn() {
		let new_state;

		switch (import_state.current_move) {
			case x_mark: new_state = o_mark;
			case o_mark: new_state = x_mark;
		}

		import_state.current_move = new_state;
		console.table(board);
	}

	function place_mark(move) {
		const { x, y } = move;

		board[x][y] = import_state.current_move;
		finish_turn();
	}

	return {
		new_game,
		place_mark,
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
