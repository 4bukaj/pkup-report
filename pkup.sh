#!/bin/sh

export $(grep -v '^#' .env | xargs)

REPO_PATH="$(cd "$(dirname "$0")/../frontend" && pwd)"
EMAIL=$USER_EMAIL
OUTPUT_BASE="$(cd "$(dirname "$0")" && pwd)"

START_DATE="2025-10-19"
END_DATE="2025-11-18"

OUTPUT="${OUTPUT_BASE}/commits"

echo ================================================================
echo "Repo: $REPO_PATH"
echo "Author: $EMAIL"
echo "Date Range: $START_DATE to $END_DATE"
echo "Output Folder: $OUTPUT"
echo ================================================================

rm -rf -- "$OUTPUT"
mkdir "$OUTPUT"

cd "$REPO_PATH" || exit 1

i=0
for sha1 in $(git rev-list --all --since="$START_DATE" --until="$END_DATE" --author="$EMAIL" --no-merges); do
    BRANCH=$(git name-rev --name-only "$sha1" \
        | awk '{print $1}' \
        | sed 's/remotes\///g' \
        | sed 's/origin\///g' \
        | sed 's/~.*//')

    BRANCH_FOLDER="${OUTPUT}/${BRANCH:-unknown}"
    
    mkdir -p "$BRANCH_FOLDER"
    git format-patch -1 "$sha1" -o "$BRANCH_FOLDER" --start-number "$i"
    i=$((i + 1))
done

echo ================================================================
echo "Done. Output stored in: $OUTPUT"
echo ================================================================
