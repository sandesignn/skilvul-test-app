import axios from "axios";
import { React, useEffect, useState } from "react";
import cookie from "js-cookie";
import Swal from "sweetalert2";

import { Container } from "react-bootstrap";
export default function ListTrackPlaylist({ match }) {
  const [track, setTrack] = useState([]);
  const [playlist, setPlaylist] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);
  const confirm = (uri) => {
    Swal.fire({
      title: "Do you want to remove this track?",
      showCancelButton: true,
      confirmButtonText: "Remove",
    }).then((result) => {
      if (result.isConfirmed) {
        handleRemove(uri);
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  };
  const handleRemove = (uri) => {
    axios
      .delete(
        `https://api.spotify.com/v1/playlists/${match.params.id}/tracks`,
        {
          headers: {
            Authorization: "Bearer " + accesToken,
          },
          data: {
            tracks: [
              {
                uri: uri,
              },
            ],
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const accesToken = cookie.get("user");
  function fetchItems() {
    axios
      .get(`https://api.spotify.com/v1/playlists/${match.params.id}/tracks`, {
        headers: {
          Authorization: "Bearer " + accesToken,
        },
      })
      .then((res) => {
        setTrack(res.data.items);
        setPlaylist(res.data.items.name);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <Container className="my-5">
      <a className="btn btn-warning" href="/">
        Back
      </a>
      <h1 className="text-center my-4">List Track {playlist}</h1>
      <table className="table table-dark table-striped">
        <thead>
          <th>Title</th>
          <th>Artists</th>
          <th>Action</th>
        </thead>
        <tbody>
          {track.map((item, idx) => {
            return (
              <tr key={idx}>
                <td>{item.track.name}</td>
                <td>{item.track.artists[0].name}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => confirm(item.track.uri)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Container>
  );
}
