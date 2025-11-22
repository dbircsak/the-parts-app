export default function PartNumberLink({ partNumber, className = "" }: { partNumber: string; className?: string }) {
  const googleImageSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(partNumber)}+oem+auto+part`;

  return (
    <a
      href={googleImageSearchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-600 hover:text-blue-800 hover:underline ${className}`}
    >
      {partNumber}
    </a>
  );
}
