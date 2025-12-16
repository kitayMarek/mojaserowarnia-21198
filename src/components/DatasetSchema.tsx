import { Helmet } from "react-helmet";

interface DatasetSchemaProps {
  name: string;
  description: string;
  url: string;
  keywords: string[];
  creator: {
    name: string;
    type?: string;
  };
  license?: string;
  isAccessibleForFree?: boolean;
  variableMeasured?: string[];
  datePublished?: string;
  dateModified?: string;
  distribution?: {
    encodingFormat: string;
    contentUrl: string;
  }[];
}

const DatasetSchema = ({
  name,
  description,
  url,
  keywords,
  creator,
  license = "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  isAccessibleForFree = true,
  variableMeasured,
  datePublished,
  dateModified,
  distribution,
}: DatasetSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url,
    keywords,
    creator: {
      "@type": creator.type || "Organization",
      name: creator.name,
    },
    license,
    isAccessibleForFree,
    ...(variableMeasured && { variableMeasured }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(distribution && {
      distribution: distribution.map((d) => ({
        "@type": "DataDownload",
        encodingFormat: d.encodingFormat,
        contentUrl: d.contentUrl,
      })),
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default DatasetSchema;
