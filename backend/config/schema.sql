create table tetris_user (
	user_id serial primary key,
	pseudo text not null unique,
	pwd text not null, 
	nb_played_games integer,
	nb_win integer,
	best_score integer
);

	

