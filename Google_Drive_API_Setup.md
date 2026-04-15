# Google Drive API 整合指南

## 🎯 目標
讓網頁可以直接將JSON檔案上傳到Google Drive，家人可以共享編輯

## 📋 設定步驟

### 1. 建立Google Cloud Project
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案（例如：nagoya-trip）
3. 啟用 Google Drive API

### 2. 建立API金鑰
1. 進行「憑證」→「建立憑證」
2. 選擇「Web應用程式」
3. 設定重新導向URI（開發用）：
   - `http://localhost:8000`
   - `https://your-username.github.io`

### 3. 設定Google Apps Script（推薦方案）
1. 前往 [Google Apps Script](https://script.google.com/)
2. 建立新專案
3. 貼上以下程式碼：

```javascript
// Google Apps Script 後端程式碼
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Nagoya Trip API')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL');
}

function saveData(data) {
  try {
    const folder = DriveApp.getFolderById('YOUR_FOLDER_ID');
    const file = folder.getFilesByName('nagoya_trip_data.json').next();
    file.setContent(JSON.stringify(data, null, 4));
    return {success: true, message: '資料已儲存'};
  } catch(e) {
    return {success: false, error: e.toString()};
  }
}

function loadData() {
  try {
    const folder = DriveApp.getFolderById('YOUR_FOLDER_ID');
    const file = folder.getFilesByName('nagoya_trip_data.json').next();
    return JSON.parse(file.getBlob().getDataAsString());
  } catch(e) {
    return {itinerary: {}, checklistData: []};
  }
}
```

## 🔧 使用方式

### 方法一：Google Apps Script（推薦）
- 設定一次後永久可用
- 家人只需Google登入
- 自動處理權限

### 方法二：直接Google Drive API
- 需要API金鑰管理
- 每次使用需要授權
- 較複雜的設定

## 📁 共享資料夾設定

1. 在Google Drive建立共享資料夾
2. 設定為「可編輯」權限
3. 將資料夾ID加入程式碼
4. 分享連結給家人

## ✅ 優點

- 🔄 即時同步
- 👥 多人協作
- 📱 跨平台支援
- 💾 自動備份
- 🔐 Google安全性保護

---

設定完成後，我會為您修改網頁整合這些功能！
