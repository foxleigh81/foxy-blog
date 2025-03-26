/**
 * Displays a banner for opinion posts, indicating that the content is an opinion and not a fact.
 */
export const OpinionBanner: React.FC = () => {
  return (
    <div className="py-4 mb-4 border-b border-gray-200">
      <div className="container mx-auto">
        <p className="text-gray-600 text-sm font-bold italic">
          <strong>Disclaimer:</strong> This content is my own opinion and should not be taken as
          fact.
        </p>
      </div>
    </div>
  );
};

export default OpinionBanner;
