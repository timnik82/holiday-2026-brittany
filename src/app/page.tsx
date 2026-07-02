import { guideConfig } from "@/config/guide";

export default function Home() {
  return (
    <>
      <h1>{guideConfig.siteTitle}</h1>
      <p>
        This guide is currently being assembled from supplied research. Content
        pages covering destinations, routes, activities, swimming, and trip
        planning will appear here as the research is reviewed and structured.
      </p>
    </>
  );
}
