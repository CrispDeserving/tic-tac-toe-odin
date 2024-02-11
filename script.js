const GameState = (() => {
	const CELL_STATES = {
		empty_cell: "_",
		x_mark: "x",
		o_mark: "o",
	};
	const PLAY_STATES = {
		playing: "PLAYING",
		draw: "DRAW",
		win: "WIN",
	};

	let play_info = PLAY_STATES.playing;
	const board_info = {
		dom_element: false,
		board: [],
	};
	const move_info = {
		dom_element: false,
		last_pressed: {},
		value: CELL_STATES.o_mark,
	};

	function update_cell(new_pressed, new_value) {
		move_info.last_pressed = new_pressed;
		const { x, y } = new_pressed;

		for (const cell of board_info.dom_element) {
			if (cell.getAttribute("x") === x.toString() && cell.getAttribute("y") === y.toString()) {
				cell.innerText = new_value;
				return;
			}
		}
	}

	function bind_move_display(move_display) {
		move_info.dom_element = move_display;
	}
	
	function bind_board_display(board_display) {
		board_info.dom_element = board_display;
	}

	return {
		CELL_STATES,
		PLAY_STATES,


		board: board_info.board,

		get current_player() {
			return move_info.value;
		},

		set current_player(value) {
			let bad_value = true;
			for (const valid_state of [CELL_STATES.o_mark, CELL_STATES.x_mark]) {
				if (valid_state === value) {
					move_info.value = value;
					bad_value = false;
					break;
				}
			}

			if (bad_value) {
				console.error("(set current_move): Not a valid change.");
				return;
			}

			move_info.dom_element.innerText = value.toUpperCase();
		},

		get play_info() {
			return play_info;
		},

		set play_info(new_value) {
			if (Object.values(PLAY_STATES).some((valid_value) => valid_value === new_value)) {
				play_info = new_value;
				return;
			}
		},

		update_cell,
		bind_move_display,
		bind_board_display,
	};
})();

const Game = ((import_state) => {
	const { board, PLAY_STATES, CELL_STATES, update_cell } = import_state;
	const { empty_cell, x_mark, o_mark } = CELL_STATES;
	const { playing, win, draw } = PLAY_STATES;

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
		import_state.current_player = o_mark;
		import_state.game_info = playing;
		reset_board();
	}

	function finish_turn() {
		let new_state;

		switch (import_state.current_player) {
			case x_mark: new_state = o_mark; break;
			case o_mark: new_state = x_mark; break;
		}

		import_state.current_player = new_state;
	}

	function place_mark(move) {
		const { current_player, play_info } = import_state;
		let { x, y } = move;

		x = parseInt(x);
		y = parseInt(y);

		if (board[x][y] !== empty_cell) return false;
		if (play_info === draw || play_info === win) {
			return false;
		}

		board[x][y] = current_player;
		if (check_for_win({x, y}, current_player)) {
			import_state.play_info = win;
			finish_game();

		} else if (check_for_draw()) {
			import_state.play_info = draw;
			alert("game is a draw");

			// TODO: something on dom

		} else {
			finish_turn();
		}

		update_cell(move, current_player);
		console.table(board);
		
		return true;
	}

	function finish_game() {
		alert(`${import_state.current_player} wins`);
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
					return value >= end_coord[_key];
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
				return true;
			}
		}

		return false;
	}

	function check_for_draw() {
		return board.every((row) => {
			return row.every((cell) => {
				return cell !== empty_cell;
			});
		});
	}

	function bind_game_controllers({ buttons, move_display }) {
		for (const btn of buttons) {
			btn.addEventListener("click", (evt) => {
				const button = evt.target;
				const x = button.getAttribute("x");
				const y = button.getAttribute("y");

				if (place_mark({ x, y })) {
					button.classList.toggle("pressed");
				}
			});
		}

		import_state.bind_move_display(move_display);
		import_state.bind_board_display(buttons);
	}

	return {
		new_game,
		place_mark,
		bind_game_controllers,
	};
})(GameState);

// Game todo:
// Board (dictates player state)
// BoardDisplay
// Player -> create_move -> update_board -> result (win or continue)
// PlayerDisplay

window.addEventListener("DOMContentLoaded", () => {
	const game_container = document.querySelector(".game-container");

	const buttons = game_container.querySelectorAll(".board .cell");
	const move_display = game_container.querySelector(".game-info .current-move");

	Game.bind_game_controllers({ buttons, move_display });
	Game.new_game();

	console.table(GameState.board);
});
