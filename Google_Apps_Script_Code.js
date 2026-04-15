// Google Apps Script 後端程式碼
// 請將此程式碼貼到 Google Apps Script 編輯器中

// 1. 設定你的共享資料夾ID
const SHARED_FOLDER_ID = 'YOUR_SHARED_FOLDER_ID_HERE'; // 請替換為實際的資料夾ID

// 2. 主要的HTML服務
function doGet(e) {
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
      <p>這是Google Drive後端API服務</p>
      <p>請將此網址加入你的網頁中</p>
      <script>
        // 顯示當前網址供複製
        document.body.innerHTML += '<p><strong>API網址:</strong> ' + window.location.href + '</p>';
      </script>
    </body>
    </html>
  `).setTitle('Nagoya Trip API').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 3. 儲存資料到Google Drive
function saveData(data) {
  try {
    const folder = DriveApp.getFolderById(SHARED_FOLDER_ID);
    
    // 尋找現有的JSON檔案
    let file;
    const files = folder.getFilesByName('nagoya_trip_data.json');
    if (files.hasNext()) {
      file = files.next();
    } else {
      // 如果檔案不存在，建立新檔案
      file = folder.createFile('nagoya_trip_data.json', JSON.stringify(data, null, 4), MimeType.JSON);
    }
    
    // 更新檔案內容
    file.setContent(JSON.stringify(data, null, 4));
    
    return {
      success: true,
      message: '資料已成功儲存到Google Drive',
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

// 4. 從Google Drive載入資料
function loadData() {
  try {
    const folder = DriveApp.getFolderById(SHARED_FOLDER_ID);
    
    // 尋找JSON檔案
    const files = folder.getFilesByName('nagoya_trip_data.json');
    if (files.hasNext()) {
      const file = files.next();
      const content = file.getBlob().getDataAsString();
      return {
        success: true,
        data: JSON.parse(content),
        message: '資料載入成功'
      };
    } else {
      // 如果檔案不存在，回傳預設資料
      return {
        success: true,
        data: {
          itinerary: {},
          checklistData: []
        },
        message: '使用預設資料'
      };
    }
  } catch(error) {
    console.error('載入失敗:', error);
    return {
      success: false,
      error: error.toString(),
      message: '載入失敗，請檢查權限設定'
    };
  }
}

// 5. 取得檔案清單（用於除錯）
function listFiles() {
  try {
    const folder = DriveApp.getFolderById(SHARED_FOLDER_ID);
    const files = [];
    const fileIterator = folder.getFiles();
    
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      files.push({
        name: file.getName(),
        size: file.getSize(),
        created: file.getDateCreated().toISOString(),
        modified: file.getLastUpdated().toISOString()
      });
    }
    
    return {
      success: true,
      files: files
    };
  } catch(error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// 6. 建立備份
function createBackup() {
  try {
    const folder = DriveApp.getFolderById(SHARED_FOLDER_ID);
    const files = folder.getFilesByName('nagoya_trip_data.json');
    
    if (files.hasNext()) {
      const originalFile = files.next();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `nagoya_trip_data_backup_${timestamp}.json`;
      
      // 建立備份檔案
      originalFile.makeCopy(backupName);
      
      return {
        success: true,
        message: `備份已建立: ${backupName}`
      };
    }
    
    return {
      success: false,
      message: '找不到原始檔案進行備份'
    };
  } catch(error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// 7. 處理POST請求
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    
    switch(params.action) {
      case 'save':
        return ContentService.createTextOutput(JSON.stringify(saveData(params.data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'load':
        return ContentService.createTextOutput(JSON.stringify(loadData()))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'backup':
        return ContentService.createTextOutput(JSON.stringify(createBackup()))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'list':
        return ContentService.createTextOutput(JSON.stringify(listFiles()))
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
