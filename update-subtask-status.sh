#!/bin/bash
# Helper script to update subtask status correctly

TASK_ID=$1
SUBTASK_ID=$2
STATUS=$3
TAG=${4:-ui-modernization}

if [ -z "$TASK_ID" ] || [ -z "$SUBTASK_ID" ] || [ -z "$STATUS" ]; then
    echo "Usage: $0 <task_id> <subtask_id> <status> [tag]"
    echo "Example: $0 2 1 in-progress ui-modernization"
    exit 1
fi

# Construct the correct subtask ID
FULL_SUBTASK_ID="${TASK_ID}.${SUBTASK_ID}"

echo "Updating subtask ${FULL_SUBTASK_ID} to status: ${STATUS}"

# Use jq to update the JSON directly
jq --arg taskId "$TASK_ID" \
   --arg subtaskId "$FULL_SUBTASK_ID" \
   --arg status "$STATUS" \
   --arg tag "$TAG" \
   '.[$tag].tasks |= map(
     if .id == ($taskId | tonumber) then
       .subtasks |= map(
         if .id == $subtaskId then
           .status = $status
         else . end
       )
     else . end
   )' .taskmaster/tasks/tasks.json > .taskmaster/tasks/tasks.json.tmp && \
   mv .taskmaster/tasks/tasks.json.tmp .taskmaster/tasks/tasks.json

echo "✓ Subtask status updated successfully"

# Regenerate task files
task-master generate --tag=$TAG