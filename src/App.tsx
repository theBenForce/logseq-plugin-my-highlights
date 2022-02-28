import React, { useRef } from "react";
import { useAppVisible } from "./utils";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    // const result = dialog.showOpenDialog({ title: 'Select Kindle Clippings' });
    // console.info(result);
    console.info('Open File', event.target.files);

    if (!event.target.files?.length) {
      return;
    }

    var reader = new FileReader();

    reader.onload = function(e) {
        var content = reader.result;
        //Here the content has been read successfuly
        console.info(content);
    }

    reader.readAsText(event.target.files[0]); 
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
        <div ref={innerRef} className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <h3>Welcome to [[Logseq]] Plugins!</h3>
          <input type="file" onChange={onFileSelected} />
        </div>
      </main>
    );
  }
  return null;
}

export default App;
