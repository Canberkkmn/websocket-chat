import React from "react";

import "./ConnectionStatus.css";

const ConnectionStatus = ({ status }) => {
  let statusClass = "status-disconnected";

  if (status === "connected") {
    statusClass = "status-connected";
  } else if (status === "connecting") {
    statusClass = "status-connecting";
  }

  return <div className={`connection-status ${statusClass}`}>{status}</div>;
};

export default ConnectionStatus;
