// ====== Bangkok 專屬記帳版 Google Apps Script ======

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;
  
  if (action === "load") {
    var result = { success: false, data: { itinerary: {}, checklistData: [], accountingData: [] } };
    
    try {
      // 1. 讀取行程表
      var itSheet = ss.getSheetByName("行程表");
      if (itSheet) {
        var itData = itSheet.getDataRange().getValues();
        // 曼谷行程總共有 10 天
        var defaultDays = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"];
        defaultDays.forEach(function(d) { result.data.itinerary[d] = []; });
        for (var i = 1; i < itData.length; i++) {
          var row = itData[i];
          var day = row[0];
          if (!day) continue;
          if (!result.data.itinerary[day]) result.data.itinerary[day] = [];
          var timeStr = row[1];
          if (timeStr instanceof Date) {
            var h = timeStr.getHours();
            var m = timeStr.getMinutes();
            timeStr = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
          } else {
            timeStr = timeStr.toString();
          }
          result.data.itinerary[day].push({ time: timeStr, type: (row[2] || "activity").toString().toLowerCase().trim(), title: (row[3] || "").toString(), desc: (row[4] || "").toString() });
        }
      }
      
      // 2. 讀取行李清單
      var clSheet = ss.getSheetByName("行李清單");
      if (clSheet) {
        var clData = clSheet.getDataRange().getValues();
        for (var j = 1; j < clData.length; j++) {
          var row = clData[j];
          if (!row[0]) continue; 
          var chk = row[1];
          var isChecked = (chk === true || chk === "TRUE" || chk === "true" || chk === "v" || chk === "V");
          result.data.checklistData.push({ text: row[0].toString(), checked: isChecked });
        }
      }

      // 3. ✨ 讀取新的「記帳表」 ✨
      var accSheet = ss.getSheetByName("記帳表");
      if (accSheet) {
        var accData = accSheet.getDataRange().getValues();
        for (var k = 1; k < accData.length; k++) {
          var row = accData[k];
          if (!row[0]) continue;
          
          var tStr = row[4];
          if (tStr instanceof Date) {
            var h2 = tStr.getHours();
            var m2 = tStr.getMinutes();
            tStr = (tStr.getMonth()+1) + '/' + tStr.getDate() + ' ' + (h2 < 10 ? "0" + h2 : h2) + ":" + (m2 < 10 ? "0" + m2 : m2);
          }
          
          result.data.accountingData.push({
            name: row[0].toString(),
            payer: row[1].toString(),
            thb: Number(row[2]) || 0, // 修改為 thb
            twd: Number(row[3]) || 0,
            time: (tStr || "").toString()
          });
        }
      }
      result.success = true;
    } catch(err) {}
    
    var callback = e.parameter.callback;
    var jsonp = callback + "(" + JSON.stringify(result) + ");";
    return ContentService.createTextOutput(jsonp).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;
  
  if (action === "save") {
    var rawData = e.parameter.data;
    if (rawData) {
      var parsed = JSON.parse(rawData);
      
      var itSheet = ss.getSheetByName("行程表");
      if (!itSheet) itSheet = ss.insertSheet("行程表");
      itSheet.clear(); 
      itSheet.getRange(1, 1, 1, 5).setValues([["日期(d1~d10)", "時間", "分類(type)", "標題", "備註"]]).setFontWeight("bold").setBackground("#dbeafe");
      var itRows = [];
      for (var day in parsed.itinerary) {
        var items = parsed.itinerary[day];
        items.forEach(function(item) { itRows.push([day, "'" + item.time, item.type, item.title, item.desc]); });
      }
      if (itRows.length > 0) {
        itSheet.getRange(2, 1, itRows.length, 5).setValues(itRows);
        itSheet.getRange("D:E").setWrap(true);
        itSheet.setColumnWidth(4, 250);
        itSheet.setColumnWidth(5, 300);
      }
      
      var clSheet = ss.getSheetByName("行李清單");
      if (!clSheet) clSheet = ss.insertSheet("行李清單");
      clSheet.clear();
      clSheet.getRange(1, 1, 1, 2).setValues([["打包項目", "是否帶了(TRUE 或手動打 V)"]]).setFontWeight("bold").setBackground("#fef9c3");
      var clRows = [];
      parsed.checklistData.forEach(function(item) { clRows.push([item.text, item.checked]);});
      if (clRows.length > 0) {
        clSheet.getRange(2, 1, clRows.length, 2).setValues(clRows);
        clSheet.setColumnWidth(1, 300);
      }

      // --- 📌 ✨ 更新新的「記帳表」 (含雙幣與時間) ✨ ---
      var accSheet = ss.getSheetByName("記帳表");
      if (!accSheet) accSheet = ss.insertSheet("記帳表");
      accSheet.clear();
      accSheet.getRange(1, 1, 1, 5).setValues([["項目名稱", "付款人", "泰銖(THB)", "台幣(TWD)", "付款時間"]]).setFontWeight("bold").setBackground("#ffedd5");
      if (parsed.accountingData && parsed.accountingData.length > 0) {
        var accRows = [];
        parsed.accountingData.forEach(function(item) {
          // 加入時間與雙幣紀錄
          accRows.push([item.name, item.payer, item.thb, item.twd, "'" + (item.time || "")]);
        });
        accSheet.getRange(2, 1, accRows.length, 5).setValues(accRows);
        accSheet.setColumnWidth(1, 250);
      }
      
      var logSheet = ss.getSheetByName("系統紀錄") || ss.insertSheet("系統紀錄");
      logSheet.getRange("A1").setValue("最後被網頁送出覆蓋的時間：").setFontWeight("bold");
      logSheet.getRange("A2").setValue(new Date().toLocaleString("zh-TW", {timeZone: "Asia/Taipei"}));
    }
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
}
