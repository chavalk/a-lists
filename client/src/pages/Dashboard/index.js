import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Watchlist from "../../components/Watchlist";
import API from "../../utils/API";
import ExtAPI from "../../utils/ExtAPI";
import logo from "../../img/logocopy.png";
import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react";
import "./style.css";

const Dashboard = () => {
    // Setting initial state
    const [watchlist, setWatchlist] = useState([]);
    const [film, setFilm] = useState("");
    const [debouncedFilm] = useDebounce(film, 500);
    const [info, setInfo] = useState({});
    const [poster, setPoster] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // Set useAuth0 hook
    const { user, isLoading } = useAuth0();

    // Loads network and store them with setnetwork
    useEffect(() => {
        loadWatchlist();
    }, []);

    useEffect(() => {
        console.log(debouncedFilm);
        handleSubmit();
    }, [debouncedFilm]);

    // Loads users saved list
    function loadWatchlist() {
        API.getWatchlist(user.email)
            .then((res) => setWatchlist(res.data))
            .catch((err) => console.log(err));
    }

    // grabs the users search input
    function handleInputChange(event) {
        event.preventDefault();
        const filmInput = event.target.value;
        setFilm(filmInput);
        
    }

    // calls 3 apis to pull search
    function handleSubmit(event) {
        if (event) event.preventDefault();
        ExtAPI.getTitles(film).then((data) => {
            if (data.data.title_results.length < 1) return;
            console.log(data.data.title_results[0].id);
            ExtAPI.getInfo(data.data.title_results[0].id).then((data) => {
                setInfo({
                    title: data.data.title,
                    type: data.data.type,
                    plot: data.data.plot_overview,
                    rating: data.data.us_rating,
                    networks: data.data.networks,
                });
            });
            ExtAPI.getPoster(film)
                .then((data) => {
                    setPoster(data.data);
                    setShowResults(true);
                })
                .catch((err) => console.log(err));
        });
    }

    function handleDelete(id) {
        API.deleteWatchlist(id)
            .then((data) => loadWatchlist())
            .catch((err) => console.log(err));
    }

    // Updates state for saving to the database
    function handleFormSave(event) {
        event.preventDefault();
        console.log(info);
        let network;
        let view_url;
        if (!info.networks) {
            network = "Other Networks";
            view_url = "/dashboard";
            alert("Unknown Network, Listed in 'Other Networks' Section");
        } else {
            switch (info.networks[0]) {
                case 1:
                case 13:
                case 826:
                case 1724:
                case 2581:
                    network = "HBO";
                    view_url = "https://www.hbomax.com/";
                    break;
                case 8:
                case 18:
                case 63:
                case 134:
                case 219:
                case 366:
                case 473:
                case 935:
                case 1922:
                case 1946:
                case 2640:
                    network = "Disney";
                    view_url = "https://www.disneyplus.com/home";
                    break;
                case 53:
                case 60:
                case 173:
                case 420:
                case 1204:
                case 1206:
                case 1925:
                case 2703:
                case 2328:
                    network = "Amazon";
                    view_url =
                        "https://www.amazon.com/Amazon-Video/b?ie=UTF8&node=2858778011";
                    break;
                case 681:
                case 822:
                    network = "Apple TV";
                    view_url = "https://www.apple.com/apple-tv-plus/";
                    break;
                case 12:
                case 21:
                case 431:
                    network = "Hulu";
                    view_url = "https://www.hulu.com/welcome";
                    break;
                case 97:
                case 248:
                case 2554:
                    network = "Netflix";
                    view_url = "https://www.netflix.com/";
                    break;
                default:
                    network = "Other Networks";
                    view_url = "/dashboard";
                    alert("Unknown Network, Listed in 'Other Networks' Section");
            }
        }
        API.saveWatchlist({
            title: info.title,
            poster_url: poster.Poster,
            network: network,
            view_url: view_url,
            email: user.email,
        }).then((res) => loadWatchlist());
    }

    function handleclearInput(event) {
        event.preventDefault();
        console.log(film);
        setFilm("");
        document.getElementById("search-form").reset();
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="container">
                <div id="imgContainer">
                    <img src={logo} alt="logo" className="dashLogo"></img>
                </div>
                <div className="jumbotron" id="searchArea">
                    <form className="input-group mb-3 shadow-lg" id="search-form">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add a Title to Your Watchlist"
                            aria-describedby="button-addon2"
                            onChange={handleInputChange}
                            onSubmit={handleSubmit}
                        ></input>
                        <button
                            className="btn btn-outline-secondary"
                            type="submit"
                            id="button-addon2"
                            onClick={handleclearInput}
                        >
                            Clear
                        </button>
                    </form>
                </div>
                {showResults ? (
                    <div className="row resultsContainer text-white text-center">
                        <div className="apiPoster col-md-6">
                            <img
                                src={poster.Poster}
                                alt="film poster"
                                id="posterResult"
                            ></img>
                        </div>
                        <div className="col-md-6" id="resultsCol">
                            <h3>{info.title}</h3>
                            <h5>Film Type: {info.type}</h5>
                            <h5>Rating: {info.rating}</h5>
                            <p>{info.plot}</p>
                            <div className="saveButton">
                                <button
                                    type="button"
                                    className="btn btn-light save"
                                    onClick={handleFormSave}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                <Watchlist
                    network="HBO Max"
                    watchlist={watchlist.filter(
                        (watchlist) => watchlist.network === "HBO"
                    )}
                    handleDelete={handleDelete}
                />

                <Watchlist
                    network="Netflix"
                    watchlist={watchlist.filter(
                        (watchlist) => watchlist.network === "Netflix"
                    )}
                    handleDelete={handleDelete}
                />

                <Watchlist
                    network="Hulu"
                    watchlist={watchlist.filter(
                        (watchlist) => watchlist.network === "Hulu"
                    )}
                    handleDelete={handleDelete}
                />

                <Watchlist
                    network="Prime Video"
                    watchlist={watchlist.filter(
                        (watchlist) => watchlist.network === "Amazon"
                    )}
                    handleDelete={handleDelete}
                />

                <Watchlist
                    network="Disney Plus"
                    watchlist={watchlist.filter(
                        (watchlist) => watchlist.network === "Disney"
                    )}
                    handleDelete={handleDelete}
                />

                <Watchlist
                    network="Apple TV Plus"
                    watchlist={watchlist.filter(
                        (watchlist) => watchlist.network === "Apple TV"
                    )}
                    handleDelete={handleDelete}
                />

                <Watchlist
                    network="Other Networks"
                    watchlist={watchlist.filter(
                        (watchlist) => watchlist.network === "Other Networks"
                    )}
                    handleDelete={handleDelete}
                />

                <Footer />
            </div>
        </div>
    );
};

export default withAuthenticationRequired(Dashboard, {
    onRedirecting: () => <div>Loading...</div>,
});
