import React from "react";
import "./style.scss";

function Ribbon({ onFileUpload, onInsert }) {
  return (
    <div className="ribbon">
      <div className="upload-file">
        <label>Upload File:</label>
        <input
          type="file"
          accept=".csv"
        />
      </div>
      <button onClick={onInsert}>Insert Row</button>
      <button onClick={onInsert}>Delete Row</button>
      <button onClick={onInsert}>Update Row</button>
    </div>
  );
}

export default Ribbon;
