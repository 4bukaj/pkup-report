import fs from "fs";
import path from "path";

export const getBranches = () => {
  const COMMITS_PATH =
    path.resolve("commits");

  if (!fs.existsSync(COMMITS_PATH)) {
    console.error(
      "Commits folder not found:",
      COMMITS_PATH
    );

    return;
  }

  const branches = fs
    .readdirSync(COMMITS_PATH, {
      withFileTypes: true,
    })
    .filter((dirent) =>
      dirent.isDirectory()
    )
    .map((dirent) => dirent.name);

  return branches.filter((branch) =>
    branch.startsWith("AIOPS")
  );
};

export const parseADF = (node) => {
  if (!node) return "";

  if (node.type === "text") {
    return node.text || "";
  }

  if (
    node.content &&
    Array.isArray(node.content)
  ) {
    return node.content
      .map(parseADF)
      .join(" ");
  }

  return "";
};

export const generateAiPrompt = (
  issues
) => {
  return `I will provide an array of JIRA issues. Each issue consist of id, title and description. Given this information I want you to briefly summarize those issues for the PKUP (autorskie koszty uzyskania przychodu) report. Your response should be a bullet point list in polish. Each point translates to one issue. Use buzzwords like "zaimplementowałem", "stworzyłem", "usprawniłem", etc. At the end of each bulletpoint include the issue id in the "()" brackets. Additionally, after the summaries, return another bullet point list with all the issues ids. Don't use hyphens or dashes or actuall bullet points. Each summary should be a new line.


Follow this example:

Issues array:

[

  {

    id: 'AIOPS-4039',

    title: 'UI: New filters component',

    description: 'As a user, I want to select basic filters in a new, more accessible way.   AC:  - new filter selection should be based on chip component  - chip need to have filter name  - chip should have counter of available item assigned  - chip can have icon available for assigned filter  - if there is no available item for selected filter chip should be in disabled state  - filter chips should work same as current filters    Design:    '

  },

  {

    id: 'AIOPS-3989',

    title: 'UI: Changing the display of the page reload selector',

    description: 'Change affects only the UI, it does not affect functionality.   Design:     '

  }

]



Output:

Zaimplementowałem nowy design przycisku do odświeżania danych (AIOPS-3989)
Zaimplementowałem nowy komponent filtrów (AIOPS-4039)

AIOPS-3989
AIOPS-4039



Array of Jira issues for you to process: ${JSON.stringify(
    issues,
    null,
    2
  )}`;
};
