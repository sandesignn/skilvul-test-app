import React from "react";

export default function Playlist({ item }) {
  return (
    <div className="m-2 text-center">
      <a href={`playlist/` + item.id}>
        <img
          src={item.images[0].url}
          style={{ height: "120px", width: "120px" }}
          className="pointer"
        />
      </a>
      <h3 className="my-2">{item.name}</h3>
    </div>
  );
}
