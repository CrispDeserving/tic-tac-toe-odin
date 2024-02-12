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
	const APP_STATES = {
		start: "start",
		game: "game",
	};

	const view_dom = {
		start: false,
		game: {
			root: false,
			playing_wrapper: false,
			done_wrapper: false,
			draw: false,
			win: false,
			player_name_display: false,
		},

		value: APP_STATES.start,
	};
	const player_names = {
		o_mark: "",
		x_mark: "",
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
		APP_STATES,
		CELL_STATES,
		PLAY_STATES,

		view_dom,
		board: board_info.board,
		player_names,

		get view_state() {
			return view_dom.value;
		},

		set view_state(new_value) {
			if (!Object.values(APP_STATES).some((valid_value) => valid_value === new_value)) return;

			const views = { game: view_dom.game.root, start: view_dom.start }; 
			for (const key in views) {
				views[key].classList.add("hidden");
			}

			views[new_value.toLowerCase()].classList.remove("hidden");
			view_dom.value = new_value;
		},

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
			}

			const game_dom = view_dom.game;
			if (new_value === PLAY_STATES.playing) {
				game_dom.playing_wrapper.classList.remove("hidden");
				game_dom.done_wrapper.classList.add("hidden");
				return;
			}

			const { done_wrapper } = game_dom;
			game_dom.playing_wrapper.classList.add("hidden");
			done_wrapper.classList.remove("hidden");

			if (new_value === PLAY_STATES.win) {
				game_dom.player_name_display.innerText = player_names[`${move_info.value}_mark`];
			}

			for (const done_states of ["win", "draw"]) {
				game_dom[done_states].classList.add("hidden");
				done_wrapper.classList.remove(done_states);
			}
			game_dom[new_value.toLowerCase()].classList.remove("hidden");
			done_wrapper.classList.add(new_value.toLowerCase());

		},

		update_cell,
		bind_move_display,
		bind_board_display,
	};
})();

const GameLogic = ((import_state) => {
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
		import_state.view_state = import_state.APP_STATES.game;
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
			finish_game(win);

		} else if (check_for_draw()) {
			finish_game(draw);

		} else {
			finish_turn();
		}

		update_cell(move, current_player);
		console.table(board);
		
		return true;
	}

	function finish_game(play_info) {
		import_state.play_info = play_info;

		if (play_info === win) {
			const winner = import_state.player_names[`${import_state.current_player}_mark`];
			alert(`${winner} wins`);

		} else if (play_info === draw) {
			alert("game is a draw");
		}
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

	function bind_game_controllers({
		game_wrapper,
		playing_wrapper,

		buttons,
		move_display,

		done_wrapper,

		draw_wrapper,
		win_wrapper,
		player_name_display,
	}) {
		const game_dom = import_state.view_dom.game;

		game_dom.root = game_wrapper;
		game_dom.playing_wrapper = playing_wrapper;
		game_dom.done_wrapper = done_wrapper;
		game_dom.win = win_wrapper;
		game_dom.player_name_display = player_name_display;
		game_dom.draw = draw_wrapper;

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

const Start = ((import_state, import_game_logic) => {
	const { view_dom } = import_state;

	function get_player_names(players) {
		const { player_names } = import_state;

		for (const player_input of players) {
			const value = player_input.value;
			const id = player_input.getAttribute("id");

			switch (id) {
				case "player-x-mark": player_names.x_mark = value; break;
				case "player-o-mark": player_names.o_mark = value; break;
			}
		}

		return Object.values(player_names).every((val) => val !== null && val.length !== 0);
	}

	function bind_start_controllers({ start_wrapper, players, start_game_btn }) {
		view_dom.start = start_wrapper;

		start_game_btn.addEventListener("click", (evt) => {
			evt.preventDefault();
			if (!get_player_names(players)) return;

			import_game_logic.new_game();
		});
	}

	return {
		bind_start_controllers,
	};
})(GameState, GameLogic);

const Game = ((import_start, import_game_logic ) => {
	const { bind_game_controllers, new_game, place_mark } = import_game_logic;
	const { bind_start_controllers } = import_start;

	function bind_dom_elements(game_dom, start_dom) {
		bind_game_controllers(game_dom);
		bind_start_controllers(start_dom);
	}

	return {
		new_game,
		place_mark,

		bind_dom_elements,
	};
})(Start, GameLogic);

// Game todo:
// Board (dictates player state)
// BoardDisplay
// Player -> create_move -> update_board -> result (win or continue)
// PlayerDisplay

window.addEventListener("DOMContentLoaded", () => {
	const game_wrapper = document.querySelector(".game");
	const game_info_wrapper = game_wrapper.querySelector(".game-info");
	const done_wrapper = game_info_wrapper.querySelector(".done");

	const game_dom = {
		game_wrapper,
		buttons: game_wrapper.querySelectorAll(".board .cell"),
		move_display: game_wrapper.querySelector(".game-info .current-move"), 

		playing_wrapper: game_info_wrapper.querySelector(".playing"),

		done_wrapper,
		win_wrapper: game_info_wrapper.querySelector(".win"),
		player_name_display: game_info_wrapper.querySelector(".win .winner"),
		draw_wrapper: game_info_wrapper.querySelector(".draw"),
	};

	const start_wrapper = document.querySelector(".start-wrapper");
	const start_dom = {
		start_wrapper,
		players: start_wrapper.querySelectorAll(`.player-name input[type="text"]`),
		start_game_btn: start_wrapper.querySelector(".start-game"),
	};

	Game.bind_dom_elements(game_dom, start_dom);
});
