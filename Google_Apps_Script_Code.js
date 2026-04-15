// Google Apps Script 後端程式碼
// 請將此程式碼貼到 Google Apps Script 編輯器中

// 1. 設定你的試算表ID
const SPREADSHEET_ID = '1Iqis5KA0yxV6WIz6kTDAI1-GBUHirebzzM54_s1Ppqk'; // Google試算表ID

// 2. 主要的HTML服務
function doGet(e) {
  try {
    // 確保e存在
    if (!e) {
      e = { parameter: {} };
    }
    
    // 支援JSONP請求
    if (e.parameter.action === 'load') {
      const data = loadData();
      const callback = e.parameter.callback;
      
      if (callback) {
        // JSONP回應
        return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        // 普通JSON回應
        return ContentService.createTextOutput(JSON.stringify(data))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
  } catch (error) {
    console.error('doGet error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // 預設HTML頁面
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nagoya Trip API</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <h1>Nagoya Trip API 服務</h1>
      <p>這是Google試算表後端API服務</p>
      <p>請將此網址加入你的網頁中</p>
      <script>
        // 顯示當前網址供複製
        document.body.innerHTML += '<p><strong>API網址:</strong> ' + window.location.href + '</p>';
      </script>
    </body>
    </html>
  `).setTitle('Nagoya Trip API').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 3. 儲存資料到Google試算表
function saveData(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 清空現有資料
    const sheet = spreadsheet.getSheets()[0];
    sheet.clear();
    
    // 寫入標題
    sheet.getRange(1, 1).setValue('類型');
    sheet.getRange(1, 2).setValue('標題');
    sheet.getRange(1, 3).setValue('時間');
    sheet.getRange(1, 4).setValue('描述');
    sheet.getRange(1, 5).setValue('日期');
    
    // 寫入行程資料
    let row = 2;
    for (const day in data.itinerary) {
      data.itinerary[day].forEach(item => {
        sheet.getRange(row, 1).setValue(item.type);
        sheet.getRange(row, 2).setValue(item.title);
        sheet.getRange(row, 3).setValue(item.time);
        sheet.getRange(row, 4).setValue(item.desc);
        sheet.getRange(row, 5).setValue(day);
        row++;
      });
    }
    
    // 寫入檢查清單到第二個工作表
    let checklistSheet;
    try {
      checklistSheet = spreadsheet.getSheetByName('Checklist');
      if (!checklistSheet) {
        checklistSheet = spreadsheet.insertSheet('Checklist');
      }
      checklistSheet.clear();
      checklistSheet.getRange(1, 1).setValue('項目');
      checklistSheet.getRange(1, 2).setValue('已完成');
      
      row = 2;
      data.checklistData.forEach(item => {
        checklistSheet.getRange(row, 1).setValue(item.text);
        checklistSheet.getRange(row, 2).setValue(item.checked);
        row++;
      });
    } catch(e) {
      console.log('Checklist sheet error:', e);
    }
    
    return {
      success: true,
      message: '資料已成功儲存到Google試算表',
      timestamp: new Date().toISOString()
    };
  } catch(error) {
    console.error('儲存失敗:', error);
    return {
      success: false,
      error: error.toString(),
      message: '儲存失敗，請檢查權限設定'
    };
  }
}

// 4. 從Google試算表載入資料
function loadData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0];
    
    const data = sheet.getDataRange().getValues();
    const itinerary = {};
    
    // 讀取行程資料（跳過標題行）
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const type = row[0];
      const title = row[1];
      const time = row[2];
      const desc = row[3];
      const day = row[4];
      
      if (!itinerary[day]) {
        itinerary[day] = [];
      }
      
      itinerary[day].push({
        type: type,
        title: title,
        time: time,
        desc: desc
      });
    }
    
    // 讀取檢查清單
    let checklistData = [];
    try {
      const checklistSheet = spreadsheet.getSheetByName('Checklist');
      if (checklistSheet) {
        const checklistDataRange = checklistSheet.getDataRange().getValues();
        for (let i = 1; i < checklistDataRange.length; i++) {
          const row = checklistDataRange[i];
          checklistData.push({
            text: row[0],
            checked: row[1] === true || row[1] === 'TRUE'
          });
        }
      }
    } catch(e) {
      console.log('Checklist load error:', e);
    }
    
    return {
      success: true,
      data: {
        itinerary: itinerary,
        checklistData: checklistData
      },
      message: '資料載入成功'
    };
  } catch(error) {
    console.error('載入失敗:', error);
    return {
      success: false,
      error: error.toString(),
      message: '載入失敗，請檢查權限設定'
    };
  }
}

// 5. 處理POST請求
function doPost(e) {
  try {
    // 確保e存在
    if (!e || !e.postData) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid request'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const params = JSON.parse(e.postData.contents);
    
    switch(params.action) {
      case 'save':
        return ContentService.createTextOutput(JSON.stringify(saveData(params.data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'load':
        return ContentService.createTextOutput(JSON.stringify(loadData()))
          .setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Unknown action'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
