const fs = require('fs');
const path = require('path');

// Function to update subtask status
function updateSubtaskStatus(parentId, subtaskId, newStatus, tag) {
  const tasksFile = path.join(__dirname, '../tasks/tasks.json');
  
  try {
    // Read the tasks file
    const data = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
    
    // Find the tag
    if (!data[tag]) {
      console.error(`Tag '${tag}' not found`);
      return false;
    }
    
    // Find the parent task
    const parentTask = data[tag].tasks.find(t => t.id === parentId);
    if (!parentTask) {
      console.error(`Parent task ${parentId} not found`);
      return false;
    }
    
    // Find the subtask
    const subtask = parentTask.subtasks?.find(st => st.id === subtaskId);
    if (!subtask) {
      console.error(`Subtask ${subtaskId} not found in parent task ${parentId}`);
      console.log('Available subtasks:', parentTask.subtasks?.map(st => st.id));
      return false;
    }
    
    // Update the status
    const oldStatus = subtask.status;
    subtask.status = newStatus;
    
    // Update the timestamp
    data[tag].metadata.updated = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(tasksFile, JSON.stringify(data, null, 2));
    
    console.log(`✅ Updated subtask ${subtaskId} status from '${oldStatus}' to '${newStatus}'`);
    return true;
    
  } catch (error) {
    console.error('Error updating subtask:', error.message);
    return false;
  }
}

// Usage
const args = process.argv.slice(2);
if (args.length !== 4) {
  console.log('Usage: node update-subtask-status.js <parentId> <subtaskId> <newStatus> <tag>');
  console.log('Example: node update-subtask-status.js 4 4.1 in-progress ui-modernization');
  process.exit(1);
}

const [parentId, subtaskId, newStatus, tag] = args;
updateSubtaskStatus(parseInt(parentId), subtaskId, newStatus, tag);