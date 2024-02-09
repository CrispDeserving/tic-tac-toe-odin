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
	}

	function place_mark(move) {
		const { current_move } = import_state;

		const { x, y } = move;
		board[x][y] = current_move;
		if (!check_for_win(move, current_move)) {
			finish_turn();
		}

		console.table(board);
	}

	function finish_game() {
		alert(`${import_state.current_move} wins`);
	}

	function check_for_win(move, current_move) {
		function nudge_coord(to, [new_x, new_y]) {
			const result = {...to};

			result.x += new_x;
			result.y += new_y;

			return result;
		}

		for (const nudge_check of [
			{ start_nudge: [0, -2], nudge: [0, +1], end_nudge: [0, +3] }, 
			{ start_nudge: [-2, 0], nudge: [+1, 0], end_nudge: [+3, 0] }, 

			{ start_nudge: [-2, -2], nudge: [+1, +1], end_nudge: [+3, +3] }, 
			{ start_nudge: [-2, +2], nudge: [+1, -1], end_nudge: [+3, -3] }, 
		]) {
			const { start_nudge, nudge, end_nudge } = nudge_check;
			const end_coord = nudge_coord(move, end_nudge);

			let count = 0;
			for (
				let coord = nudge_coord(move, start_nudge);
				!Object.entries(coord).every(([_key, value]) => {
					return value === end_coord[_key];
				});
				coord = nudge_coord(coord, nudge)
			) {
				if (!board.hasOwnProperty(coord.x)) {
					continue;
				}

				const row = board[coord.x];
				if (!row.hasOwnProperty(coord.y)) {
					continue;
				}

				if (row[coord.y] === current_move) {
					count += 1;
				}
			}

			if (count === 3) {
				finish_game();
				return true;
			}
		}

		return false;
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
