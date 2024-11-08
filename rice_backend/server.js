const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 5000;

app.use(bodyParser.json());

app.use(cors());

const dataFilePath = path.join(__dirname, "data.json");

app.post("/history", (req, res) => {
  const formData = req.body;
  const uniqueID = uuidv4();
  console.log("Generated ID:", uniqueID);

  const dataToSubmit = {
    ID: uniqueID,
    ID_Inspect: formData.ID_Inspect,
    name: formData.name,
    standard: formData.standard,
    imgUrl: formData.imgUrl,
    upload: formData.upload ? formData.upload : null,
    note: formData.note,
    price: formData.price,
    samplingPoints: formData.samplingPoints,
    dateTime: formData.dateTime,
    dateTimeSubmitted: formData.dateTimeSubmitted,
    dateLastUpdate: formData.lastTimeUpdated,
    standardData: formData.standardData || [],
    typeweight: formData.typeweight,
    shapeweight: formData.shapeweight,
    totalGrains: formData.totalGrains,
  };

  fs.readFile(dataFilePath, (err, data) => {
    let jsonData = [];

    if (err || !data || data.toString().trim() === "") {
      console.log("data.json not found or is empty, creating new file...");
      jsonData = [];
    } else {
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing data.json:", parseError);
        return res.status(500).send("Error parsing data.");
      }
    }

    jsonData.push(dataToSubmit);

    fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to data.json:", err);
        return res.status(500).send("Error saving data.");
      }

      console.log("Data saved successfully to data.json.");

      return res.status(200).json({ id: uniqueID });
    });
  });
});

app.get("/history", (req, res) => {
  const { page = 1, limit = 5, searchId, fromDate, toDate } = req.query;
  // console.log("Request params - Page:", page, "Limit:", limit, "SearchId:", searchId, "FromDate:", fromDate, "ToDate:", toDate);

  fs.readFile(dataFilePath, (err, data) => {
    if (err || !data || data.toString().trim() === "") {
      console.log("No data found in data.json or file is empty.");
      return res.json({
        records: [],
        totalPages: 0,
      });
    }

    let jsonData = [];
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing data.json:", parseError);
      return res.json({
        records: [],
        totalPages: 0,
      });
    }

    if (searchId) {
      jsonData = jsonData.filter(record => record.ID && record.ID.startsWith(searchId));
    }

    if (fromDate || toDate) {
      const startDate = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const endDate = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;
    
      jsonData = jsonData.filter(record => {
        const recordDate = new Date(record.dateTimeSubmitted).getTime();
        const afterStart = startDate ? recordDate >= startDate : true;
        const beforeEnd = endDate ? recordDate <= endDate : true;
        return afterStart && beforeEnd;
      });
    }    

    jsonData.sort((a, b) => {
      const dateA = new Date(a.dateTimeSubmitted);
      const dateB = new Date(b.dateTimeSubmitted);
      return dateB - dateA;
    });

    const totalPages = Math.ceil(jsonData.length / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = jsonData.slice(startIndex, startIndex + limit);

    res.json({
      records: paginatedData,
      totalPages,
    });
  });
});


app.get("/history/:searchId?", (req, res) => {
  const searchId = req.params.searchId || "";
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  fs.readFile(dataFilePath, (err, data) => {
    if (err || !data) {
      return res.status(500).send("Error reading data.");
    }

    let jsonData = [];
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).send("Error parsing data.");
    }

    if (searchId) {
      jsonData = jsonData.filter(
        (record) => record.ID && record.ID.startsWith(searchId)
      );
    }

    if (fromDate && toDate) {
      jsonData = jsonData.filter((record) => {
        const recordDate = new Date(record.dateTime);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return recordDate >= from && recordDate <= to;
      });
    }

    jsonData.sort((a, b) => {
      const dateA = new Date(a.dateTimeSubmitted);
      const dateB = new Date(b.dateTimeSubmitted);
      return dateB - dateA;
    });

    const totalRecords = jsonData.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const offset = (page - 1) * limit;
    const paginatedData = jsonData.slice(offset, offset + limit);

    res.json({
      records: paginatedData,
      totalPages: totalPages,
    });
  });
});

app.delete("/history/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(dataFilePath, (err, data) => {
    if (err) {
      console.error("Error reading data file:", err);
      return res.status(500).send("Error reading data.");
    }

    let jsonData = [];

    if (data) {
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing data:", parseError);
        return res.status(500).send("Error parsing data.");
      }
    }

    const index = jsonData.findIndex((record) => record.ID === id);

    if (index === -1) {
      return res.status(404).send("Record not found");
    }

    jsonData.splice(index, 1);

    fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error("Error writing data:", err);
        return res.status(500).send("Error saving data.");
      }

      return res.status(200).send("Record deleted successfully");
    });
  });
});

app.get("/result/:id", (req, res) => {
  const { id } = req.params;

  fs.readFile(dataFilePath, (err, data) => {
    if (err || !data || data.toString().trim() === "") {
      console.log("No data found in data.json or file is empty.");
      return res.status(404).json({ message: "Inspection not found." });
    }

    let jsonData = [];
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing data.json:", parseError);
      return res.status(500).json({ message: "Error parsing data." });
    }

    const inspection = jsonData.find((item) => item.ID === id);

    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found." });
    }

    res.json(inspection);
  });
});

app.put("/history/:id", (req, res) => {
  const { id } = req.params;
  const { note, price, dateTime, samplingPoints } = req.body;

  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data.json:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    let jsonData = [];
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing data.json:", parseError);
      return res.status(500).json({ error: "Error parsing data.json" });
    }

    const recordIndex = jsonData.findIndex((item) => item.ID === id);
    if (recordIndex === -1) {
      return res.status(404).json({ error: "Record not found" });
    }

    jsonData[recordIndex].note = note || jsonData[recordIndex].note;
    jsonData[recordIndex].price = price || jsonData[recordIndex].price;
    jsonData[recordIndex].dateTime = dateTime || jsonData[recordIndex].dateTime;
    jsonData[recordIndex].samplingPoints =
      samplingPoints || jsonData[recordIndex].samplingPoints;

    const currentDateTime = new Date();
    jsonData[recordIndex].dateLastUpdate = currentDateTime;

    fs.writeFile(
      dataFilePath,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing data.json:", writeErr);
          return res.status(500).json({ error: "Error writing to data.json" });
        }
        res.status(200).json({ message: "Data updated successfully" });
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
