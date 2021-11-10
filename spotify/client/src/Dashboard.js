import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import Playlist from "./Playlist";
import TrackSearchResult from "./TrackSearchResult";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  clientId: "2236c1bf0dc6453bb5e31e12cb0ca39b",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [profile, setProfile] = useState();
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  useEffect(() => {
    if (!playingTrack) return;

    axios
      .get("http://localhost:3001/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken]);

  useEffect(async () => {
    axios
      .get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
      .then((profile) => {
        setProfile(profile.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      getPlaylist();
    }
  }, [accessToken]);
  function getPlaylist() {
    axios
      .get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
      .then((playlist) => {
        setPlaylist(playlist.data.items);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <>
      <Container className="d-flex flex-column py-2">
        <Form.Control
          type="search"
          placeholder="Search Songs/Artists"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Container className="text-center my-5">
          <h2>{profile?.display_name}</h2>
          <p className="text-secondary">{profile?.email}</p>
          <p className="badge badge-warning text-white">{profile?.product}</p>
        </Container>
        <Container>
          <h3 className="text-center my-4">Your Playlist</h3>
          <div className="d-flex m-2 align-items-center text-center">
            {loading ? (
              <div className="text-center">loading...</div>
            ) : (
              playlist?.map((item) => {
                return <Playlist key={item.id} item={item} />;
              })
            )}
          </div>
          <div className="my-4">
            <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
          </div>
        </Container>

        <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
          {searchResults.map((track) => (
            <TrackSearchResult
              track={track}
              key={track.uri}
              chooseTrack={chooseTrack}
            />
          ))}
          {searchResults.length === 0 && (
            <div className="text-center" style={{ whiteSpace: "pre" }}>
              {lyrics}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
