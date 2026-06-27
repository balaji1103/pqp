// Google Apps Script Code - Deploy as Web App
// This script receives attendance data and stores it in Google Sheets

// Get the spreadsheet (You'll set this up)
const SHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Attendance';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Get the sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Check if headers exist
    if (sheet.getLastRow() === 0) {
      addHeaders(sheet);
    }
    
    // Add the data row
    sheet.appendRow([
      data.timestamp,
      data.staffName,
      data.staffId,
      data.department,
      data.latitude,
      data.longitude,
      data.accuracy,
      data.remarks,
      '=IMAGE("' + data.selfie + '")', // Embedded image formula
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    ]);
    
    // Auto-fit columns
    sheet.autoResizeColumns(1, 10);
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Attendance recorded successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function addHeaders(sheet) {
  sheet.appendRow([
    'Timestamp',
    'Staff Name',
    'Staff ID',
    'Department',
    'Latitude',
    'Longitude',
    'Accuracy (m)',
    'Remarks',
    'Selfie',
    'Submission Time'
  ]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, 10);
  headerRange.setBackground('#1976d2');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
}

// Optional: Function to get attendance summary
function getAttendanceSummary() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  const summary = {};
  for (let i = 1; i < data.length; i++) {
    const staffId = data[i][2];
    const date = data[i][0].split(' ')[0];
    const key = staffId + '_' + date;
    
    if (!summary[key]) {
      summary[key] = {
        staffId: staffId,
        staffName: data[i][1],
        date: date,
        count: 1
      };
    } else {
      summary[key].count++;
    }
  }
  
  return summary;
}
