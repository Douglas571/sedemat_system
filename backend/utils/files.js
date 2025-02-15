
const dayjs = require('dayjs');

function getFolderName() {
  const now = new dayjs();
  
  // Get the month as a 3-letter abbreviation (e.g., "Feb", "Mar")
  const month = now.format('MM');
  
  // Get the day of the month (e.g., "25")
  const year = now.format('YYYY');
  
  // Combine the month and day to form the folder name (e.g., "feb25")
  const folderName = `${year}_${month}`;
  
  return folderName.toLowerCase();
}

module.exports = {
  getFolderName
}