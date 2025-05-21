export type Props = {
  year: string;
};

/**
 * Displays a banner for legacy posts, indicating that the content may be outdated and images may not be available or be low quality.
 */
export const LegacyBanner: React.FC<Props> = ({ year }: Props): React.ReactElement => {
  return (
    <div className="bg-red-100 p-4 mb-4 rounded-lg">
      <div className="container mx-auto">
        <p className="text-red-800 text-sm font-bold">
          <strong>NOTE:</strong> This is a legacy post from {year}. Some content may be outdated and
          images may not be available or be low quality.
        </p>
      </div>
    </div>
  );
};

export default LegacyBanner;
