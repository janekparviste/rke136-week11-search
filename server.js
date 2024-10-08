const express = require('express');
const axios = require('axios');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
    res.render('search', { movieDetails: '' });
});

app.post('/search', (req, res) => {
    let userMovieTitle = req.body.movieTitle;

    let movieUrl = `https://api.themoviedb.org/3/search/movie?query=${userMovieTitle}&api_key=66d9e7e01da7ecd4981ea9123b980bbf`;

    let genresUrl =
        'https://api.themoviedb.org/3/genre/movie/list?api_key=66d9e7e01da7ecd4981ea9123b980bbf&language=en-US';

    let endpoints = [movieUrl, genresUrl];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
        axios.spread((movie, genres) => {
            const [movieRow] = movie.data.results;
            let movieGenreIds = movieRow.genre_ids;
            let movieGenres = genres.data.genres;

            let movieGenresArray = [];

            for (let i = 0; i < movieGenreIds.length; i++) {
                for (let j = 0; j < movieGenres.length; j++) {
                    if (movieGenreIds[i] === movieGenres[j].id) {
                        movieGenresArray.push(movieGenres[j].name);
                    }
                }
            }

            let genresToDisplay = '';
            movieGenresArray.forEach((genre) => {
                genresToDisplay = genresToDisplay + `${genre}, `;
            });
            let genresUpdated = genresToDisplay.slice(0, -2) + '.';

            let movieData = {
                title: movieRow.title,
                year: new Date(movieRow.release_date).getFullYear(),
                genres: genresUpdated,
                overview: movieRow.overview,
                posterUrl: `https://image.tmdb.org/t/p/w500${movieRow.poster_path}`,
            };

            res.render('search', { movieDetails: movieData });
        })
    );
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running.');
});
