//External
import axios from "axios";
import { OpenAI } from "openai";
import "dotenv/config";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
//Utils
import {
  generateAiPrompt,
  getBranches,
  parseADF,
} from "./utils.js";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.ORG_ID,
  project: process.env.PROJECT_ID,
});

const token = Buffer.from(
  `${process.env.USER_EMAIL}:${process.env.ATLASIAN_API_KEY}`
).toString("base64");

exec("sh ./pkup.sh", (error) => {
  if (error) {
    console.error(
      "Script error:",
      error
    );
    return;
  }

  const branches = getBranches();

  if (!branches.length) {
    console.error(
      "No matching commits found"
    );
    return;
  }

  getJiraIssues(branches);
});

const getJiraIssues = async (
  issues
) => {
  await axios
    .get(
      `https://cobrick.atlassian.net/rest/api/3/search/jql`,
      {
        params: {
          jql: `key in (${issues.join(
            ","
          )})`,
          fields: "summary,description",
          maxResults: 1000,
        },
        headers: {
          Authorization: `Basic ${token}`,
          Accept: "application/json",
        },
      }
    )
    .then((res) => {
      handleIssuesSummary(
        res.data.issues
      );
    })
    .catch((err) =>
      console.error(
        err.response?.data ||
          err.message
      )
    );
};

const handleIssuesSummary = async (
  issues
) => {
  if (!issues.length) {
    console.error("No issues found");
    return;
  }

  const mappedIssues = issues.map(
    (issue) => ({
      id: issue.key,
      title: issue.fields.summary,
      description: parseADF(
        issue.fields.description
      ),
    })
  );

  const response =
    await openAi.responses.create({
      model: "gpt-5-nano",
      input: generateAiPrompt(
        mappedIssues
      ),
    });

  const outputPath = path.resolve(
    "output.txt"
  );
  fs.writeFileSync(
    outputPath,
    response.output_text,
    "utf8"
  );

  console.log(
    `✅ Response saved to: ${outputPath}`
  );
};
