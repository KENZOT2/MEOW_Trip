# 名古屋生日旅行 - GitHub 共編指南

## 📋 檔案說明

### 主要檔案
- **`Nagoya_Trip_2026_Collaborative.html`** - 主要的共編網頁
- **`nagoya_trip_data.json`** - 行程資料檔案（家人主要編輯這個）
- **`README_共編說明.md`** - 本說明文件

## 🚀 快速開始

### 1. 上傳到 GitHub
1. 在 GitHub 建立新的 Repository（公開即可）
2. 上傳這三個檔案
3. 開啟 GitHub Pages 功能

### 2. 設定 GitHub Pages
1. 進入 Repository 的 Settings
2. 找到 Pages 選項
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main" 和 "/ (root)"
5. 點擊 Save

### 3. 分享網頁
幾分鐘後，家人就可以透過以下網址瀏覽：
`https://你的帳號.github.io/你的Repository名稱/Nagoya_Trip_2026_Collaborative.html`

## 👥 家人如何共編

### 方法一：直接編輯 JSON 檔案（最推薦）
1. 進入 GitHub Repository
2. 點擊 `nagoya_trip_data.json` 檔案
3. 點擊右上角的鉛筆圖案 ✏️
4. 直接修改行程內容
5. 在最下方填寫 "Create a new branch for this commit and start a pull request."
6. 點擊 "Propose changes" → "Create pull request"

### 方法二：使用網頁編輯模式
1. 開啟網頁後點擊右上角「開啟編輯」
2. 直接點擊任何文字進行編輯
3. 編輯完成後點擊「儲存並匯出」
4. 將新的 HTML 檔案上傳回 GitHub

## 📝 JSON 檔案結構說明

### itinerary 物件
```json
{
  "d1": [  // 第一天行程
    {
      "type": "flight",     // 類型: flight, hotel, food, transport, activity
      "title": "行程標題",
      "time": "17:15",      // 時間（24小時制）
      "desc": "詳細描述"    // 換行用 \\n
    }
  ]
}
```

### checklistData 陣列
```json
[
  {
    "text": "準備事項",
    "checked": false  // true 已完成, false 未完成
  }
]
```

## 🔧 常見編輯範例

### 新增行程項目
```json
{
  "type": "food",
  "title": "晚餐",
  "time": "19:00",
  "desc": "名古屋車站附近"
}
```

### 修改時間
```json
"time": "14:30"  // 改為下午2:30
```

### 修改描述
```json
"desc": "新地址：\\n電話：\\n備註："
```

## 🎨 類型對應顏色
- ✈️ **flight** - 藍色（航班）
- 🏨 **hotel** - 紫色（住宿）
- 🍴 **food** - 黃色（餐飲）
- 🚆 **transport** - 綠色（交通）
- ⭐ **activity** - 紅色（活動）

## 💡 使用技巧

1. **時間排序**：行程會自動按時間順序排列
2. **版本控制**：GitHub 會自動保存所有修改歷史
3. **即時預覽**：修改 JSON 後，重新整理網頁即可看到效果
4. **多人協作**：家人可以同時編輯，GitHub 會處理衝突

## 🆘 問題解決

### Q: 網頁無法顯示？
A: 確認 GitHub Pages 已啟用，等待幾分鐘讓設定生效

### Q: JSON 格式錯誤？
A: 使用 [JSON Validator](https://jsonlint.com/) 檢查格式

### Q: 修改沒有生效？
A: 清除瀏覽器快取，或強制重新整理 (Ctrl+F5)

## 📞 聯絡方式
如有技術問題，請聯繫建立此共編系統的人！

---
祝旅途愉快！🎉
