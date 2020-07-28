import React from 'react';
import './index.css';
import moment from 'moment';
import {
  Button, Col,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
  Card, CardImg, Badge,
  Row, ButtonGroup,
} from "reactstrap";
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css";
import Pagination from "react-js-pagination";
import Modal from 'react-modal';
import YouTube from '@u-wave/react-youtube';
require("bootstrap/dist/css/bootstrap.css");
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      genres: [],
      search: [],
      pageNumber: 1,
      updateAPI: "/discover/movie",
      query: "",
      allMovies: [],
      movies: [],
      yearRange: { min: 1990, max: 2020 },
      genre_ids: [],
      totalItemsCount: 0,
      rating: { min: 0, max: 10 },
      isOpen: false,
      videoKey: "",
      movieId: '',

    }
  }

  componentDidMount() {
    this.getGenresId()
    this.getMoviesData()

  }

  updateQuery = (evt) => {
    this.setState({
      query: evt.target.value,
      updateAPI: "/search/movie",
      pageNumber: 1,
      movies: []
    });
  }

  getNowPlayingMovies = () => {
    this.setState({
      updateAPI: "/movie/now_playing",
      query: "",
      pageNumber: 1,
      movies: []
    })

    this.getMoviesData()
    return this.renderMovies()
  }
  getTopRatedMovies = () => {
    this.setState({
      updateAPI: "/movie/top_rated",
      query: "",
      pageNumber: 1,
      movies: []
    })

    this.getMoviesData()
  }

  getUpcomingMovies = () => {
    this.setState({
      updateAPI: "/movie/upcoming",
      query: "",
      pageNumber: 1,
      movies: []
    })
    return this.getMoviesData()
  }

  showAllMovies = () => {
    const { allMovies } = this.state
    this.setState({
      movies: allMovies
    })
    return this.renderMovies()
  }
  sortMostRated = () => {
    const newMovies = this.state.movies.sort((a, b) => {
      return b.vote_average - a.vote_average
    })
    this.setState({
      movies: newMovies
    })
  }
  //sort rating
  ratingRange = () => {
    this.setState({ movies: this.state.allMovies });
    let sortedRating = this.state.movies.filter(
      movie =>
        movie.vote_average < this.state.rating.max &&
        this.state.rating.min < movie.vote_average
    );
    if (this.state.rating.min === 0 && this.state.rating.max === 10) {
      this.setState({
        movies: this.state.allMovies,

      });
    } else {
      this.setState({
        movies: sortedRating,
      });
    }
  };
  // sort year
  yearSort = () => {
    this.setState({ movies: this.state.allMovies });
    let sortedYear = this.state.movies.filter(
      movie =>
        parseInt(movie.release_date.split("-")[0]) <= this.state.yearRange.max &&
        this.state.yearRange.min <= parseInt(movie.release_date.split("-")[0])
    );
    if (this.state.yearRange.min === 0 && this.state.yearRange.max === 2020) {
      this.setState({
        movies: this.state.allMovies,

      });
    } else {
      this.setState({
        movies: sortedYear,

      });
    }
  };


  handlePageChange = () => {
    const { pageNumber } = this.state
    this.setState({
      pageNumber: pageNumber + 1
    }, () => this.getMoviesData())
    // console.log(this.state.pageNumber)

  }

  getMoviesData = async () => {
    const API_KEY = "5efeceba80d018d9f6217b223a51a812";
    const { pageNumber, updateAPI, query } = this.state
    const url = `https://api.themoviedb.org/3${updateAPI}?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${pageNumber}&query=${query}`
    let response = await fetch(url);
    let data = await response.json();
    console.log("ghhgj", await data.results)
    let newState = data.results
    this.setState({
      movies: newState,
      allMovies: this.state.allMovies.concat(newState),
      totalItemsCount: data.total_pages
    })
  }

  getPosterImgUrl(poster_path) {
    return poster_path === null ? `https://previews.123rf.com/images/mousemd/mousemd1710/mousemd171000009/87405336-404-not-found-concept-glitch-style-vector.jpg` : `https://image.tmdb.org/t/p/w500${poster_path}`
  }

  getMoviesVideos = async (movieId) => {
    const API_KEY = "5efeceba80d018d9f6217b223a51a812";
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
    let response = await fetch(url);
    let data = await response.json();
    this.setState({
      videoKey: data.results[Math.floor(Math.random() * data.results.length)].key,
    })
  }

  renderModal = (movieId) => {
    this.getMoviesVideos(movieId)
  }
  handleCloseModal = () => {
    this.setState({ isOpen: false });
  }



  renderMovies() {

    return this.state.movies.map(({ title, poster_path, release_date, backdrop_path, vote_average, genre_ids, id }) => {
      console.log('genre_ids:', genre_ids)
      console.log('this.state.genres:', this.state.genres)
      return (
        <Card style={{ width: '15rem', height: '34rem', margin: 50, backgroundColor: "black", display: "flex", paddingBottom: 40 }}>
          <CardImg src={this.getPosterImgUrl(poster_path, backdrop_path)} alt="Card image cap" />
          <div className="text-white pt-3"><h5>{title}</h5></div>
          <div className="h-100 d-flex">
            <Row className="align-self-end w-100">
              <Col md={10}><p className="text-white-50">{release_date}<br></br>{moment(release_date, "YYYYMMDD").fromNow()}</p></Col>
              <Col md={2}><Badge color="warning">{vote_average}</Badge></Col>
              <Col md={12}>{genre_ids.map(id => <Badge>{this.state.genres.find(item => item.id === id).name}</Badge>)}</Col>
            </Row>
          </div>
          <Row style={{ margin: 10 }}>
            <Button color="primary" onClick={() => this.setState({ isOpen: true, movieId: id }, () => this.renderModal(id))}>Watch Trailer</Button>
          </Row>
        </Card>
      )
    })
  }

  getGenresId = async () => {
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=5efeceba80d018d9f6217b223a51a812&language=en-US`
    let response = await fetch(url);
    let data = await response.json();
    let genresList = data.genres
    console.log("genres", genresList)
    this.setState({
      genres: genresList
    })

  }

  renderGenresList() {

    return this.state.genres.map(({ name, id }) => {
      return (
        <Button outline color="warning" onClick={() => this.selectedGenres(id)}>{name}</Button>
      )
    })
  }

  selectedGenres = (id) => {
    const movieOfGenres = this.state.allMovies.filter(movie => {
      return movie.genre_ids.some(x => x === id) === true
    })


    this.setState({
      movies: movieOfGenres
    })
    return this.renderMovies()
  }


  render() {
    return (
      <div style={{ backgroundColor: "black" }}>
        <Modal
          isOpen={this.state.isOpen}
          onRequestClose={this.handleCloseModal}
          shouldCloseOnOverlayClick={true}
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0)",
              top: '0%',
              left: '0%',
              right: '0%',
              bottom: '0%',
              marginRight: '-10%',
            },
            content: {
              top: '10%',
              left: '10%',
              right: '10%',
              bottom: '10%',
              marginRight: '0%',
              backgroundColor: "(0, 0, 0, 0)",
              border: "none",
            }
          }}
        >
          <Button color="warning" onClick={this.handleCloseModal}>close</Button>
          <YouTube video={this.state.videoKey}
            height="90%"
            width="90%"
          />
        </Modal>
        <Navbar style={{ backgroundColor: 'rgba(52, 52, 52, 0.7)' }} dark expand="md" sticky="top">
          <NavbarBrand className="align-center" href="/"> <img src="https://pbs.twimg.com/profile_images/979793365402378240/VcPN7WHD_400x400.jpg" width="80" height="50" alt='brand' />Movie Free</NavbarBrand>
          <Nav navbar>
            <NavItem>
              <NavLink href="#" onClick={this.getNowPlayingMovies} className="text-warning">Now Playing</NavLink>
            </NavItem>
            <NavItem> 
              <NavLink href="#" onClick={this.getTopRatedMovies} className="text-warning">Top Rated</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#" onClick={this.getUpcomingMovies} className="text-warning">Upcoming</NavLink>
            </NavItem>
          </Nav>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <InputGroup>
                <Input placeholder="Find a movie" value={this.state.query} onChange={evt => this.updateQuery(evt)} />
                <InputGroupAddon addonType="prepend">
                  <Button color="warning" className="search-button" onClick={this.getMoviesData}>Search</Button>
                </InputGroupAddon>
              </InputGroup>
            </NavItem>
          </Nav>
        </Navbar>
        <div style={{ color: "white", width: "250px", margin: "auto" }}>
          <p>Rating</p>
          <InputRange
            // formatLabel={value => `${value}✨`}
            step={0.5}
            maxValue={10}
            minValue={0}
            value={this.state.rating}
            onChange={rating => {
              this.setState({ rating });
              this.ratingRange();
            }}
          />
        </div>
        <br></br>
        <div style={{ color: "white", width: "250px", margin: "auto" }}>
          <p>Year</p>
          <InputRange
            step={1}
            maxValue={2020}
            minValue={1990}
            value={this.state.yearRange}
            onChange={yearRange => {
              this.setState({ yearRange });
              this.yearSort();

            }}
          />
        </div>
        {/*The fetched list of movies*/}
        <div className="m-0 w-100">
          <Row className="w-100">
            <Col md={2} className="p-5">
              <Row>
                <Button href="#" onClick={this.sortMostRated} color="warning" className="mt-5">Most Vote</Button>
              </Row>
              <Row>
                <ButtonGroup vertical>
                  {this.renderGenresList()}
                </ButtonGroup>
              </Row>
            </Col>
            <Col className="content">
              <Container style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                {this.renderMovies()}
              </Container>
            </Col>
          </Row>
        </div>
        <div className="h-50 pb-4 d-flex justify-content-center">
          {/* <Button color="warning" size="lg" onClick={c}>Load More</Button> */}
          <Pagination
            activePage={this.state.pageNumber}
            totalItemsCount={450}
            onChange={this.handlePageChange}
          />



        </div>
      </div>
    )
  }
}

export default App;
