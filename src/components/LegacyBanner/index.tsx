
export type Props = {
    year: string
}

  /**
   * Displays a banner for legacy posts, indicating that the content may be outdated and images may not be available or be low quality.
   *
   * @param {{ year: string }} props The year the post was originally published.
   * @returns {JSX.Element} The legacy banner component.
   */
export const LegacyBanner: React.FC<Props> = ({ year }) => {
  return (
    <div className="bg-red-100 p-4 mb-4 rounded-lg">
      <div className="container mx-auto">
        <p className="text-red-600 text-sm font-bold">
          <strong>NOTE:</strong> This is a legacy post from {year}. Some content may be outdated and images may not be available or be low quality.
        </p>
      </div>
    </div>
  );
};

export default LegacyBanner;
