#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get command line arguments
const [,, parentId, subtaskId, newStatus, tag] = process.argv;

if (!parentId || !subtaskId || !newStatus || !tag) {
  console.error('Usage: node update-subtask-status.js <parentId> <subtaskId> <newStatus> <tag>');
  console.error('Example: node update-subtask-status.js 4 4.1 in-progress ui-modernization');
  process.exit(1);
}

// Path to tasks.json
const tasksPath = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json');

try {
  // Read current tasks
  const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  
  // Find the project by tag
  if (!tasksData[tag]) {
    console.error(`Tag "${tag}" not found in tasks.json`);
    process.exit(1);
  }
  
  // Find the parent task
  const parentTask = tasksData[tag].tasks.find(t => t.id === parseInt(parentId));
  if (!parentTask) {
    console.error(`Parent task ${parentId} not found`);
    process.exit(1);
  }
  
  // Find and update the subtask
  let found = false;
  if (parentTask.subtasks) {
    parentTask.subtasks = parentTask.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        found = true;
        const oldStatus = subtask.status;
        subtask.status = newStatus;
        console.log(`Updated subtask ${subtaskId} status from "${oldStatus}" to "${newStatus}"`);
        return subtask;
      }
      return subtask;
    });
  }
  
  if (!found) {
    console.error(`Subtask ${subtaskId} not found in task ${parentId}`);
    process.exit(1);
  }
  
  // Update metadata
  tasksData[tag].metadata.updated = new Date().toISOString();
  
  // Write back to file
  fs.writeFileSync(tasksPath, JSON.stringify(tasksData, null, 2));
  console.log('Successfully updated tasks.json');
  
} catch (error) {
  console.error('Error updating subtask status:', error.message);
  process.exit(1);
}