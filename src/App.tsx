import React, { useRef } from "react";
import { useAppVisible } from "./utils";
import { dialog } from 'electron';

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();

  const showFileOpen = async () => {
    const result = dialog.showOpenDialog({ title: 'Select Kindle Clippings' });
    console.info(result);
  }

  if (visible) {
    return (
      <main
        className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div ref={innerRef} className="text-size-2em">
          <h3>Welcome to [[Logseq]] Plugins!</h3>
          <button onClick={showFileOpen}>Select File</button>
        </div>
      </main>
    );
  }
  return null;
}

export default App;
