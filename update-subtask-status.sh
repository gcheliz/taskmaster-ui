#!/bin/bash

# Script to update subtask status in task-master
# Usage: ./update-subtask-status.sh <parentId> <subtaskNumber> <newStatus> <tag>

if [ $# -ne 4 ]; then
    echo "Usage: $0 <parentId> <subtaskNumber> <newStatus> <tag>"
    echo "Example: $0 6 1 done ui-modernization"
    exit 1
fi

PARENT_ID=$1
SUBTASK_NUMBER=$2
NEW_STATUS=$3
TAG=$4

# Construct the full subtask ID
SUBTASK_ID="${PARENT_ID}.${SUBTASK_NUMBER}"

echo "Updating subtask ${SUBTASK_ID} to status: ${NEW_STATUS} (tag: ${TAG})"

# Use task-master to update the subtask status
task-master set-status --id="${SUBTASK_ID}" --status="${NEW_STATUS}" --tag="${TAG}"