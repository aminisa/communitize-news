import { useParams } from "react-router-dom";

const ZipCodeFeed = () => {
  const { zip } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">News Feed for ZIP Code: {zip}</h1>
    </div>
  );
};

export default ZipCodeFeed;
