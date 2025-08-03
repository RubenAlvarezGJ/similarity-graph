import whiteImage from "../assets/white_box.png";

function UrlPreviewBox({ url }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-white rounded-lg bg-black max-w-xl">
      <img
        src={whiteImage}
        alt="Preview"
        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
      />
      <div className="break-all text-white">
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
