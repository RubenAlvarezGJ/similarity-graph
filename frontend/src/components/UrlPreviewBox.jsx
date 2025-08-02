import whiteImage from "../assets/white_box.png";

function UrlPreviewBox({ url }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-white rounded-lg shadow-lg bg-black max-w-xl">
      <img
        src={whiteImage} // place holder
        alt="Preview"
        className="w-18 h-18 object-cover rounded-md flex-shrink-0"
      />
      <div className="break-words text-white">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:underline"
        >
          {url}
        </a>
      </div>
    </div>
  );
}

export default UrlPreviewBox;
