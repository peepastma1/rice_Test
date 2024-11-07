const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Path to the data.json file
const dataFilePath = path.join(__dirname, "data.json");

// POST endpoint to handle the form submission
app.post("/history", (req, res) => {
  const formData = req.body;
  const uniqueID = uuidv4();
  console.log("Generated ID:", uniqueID);

  // Create an object with the submitted form data
  const dataToSubmit = {
    ID: uniqueID,
    ID_Inspect: formData.ID_Inspect,
    name: formData.name,
    standard: formData.standard,
    upload: formData.upload ? formData.upload : null, // You may want to pass only the name, or the full file info
    note: formData.note,
    price: formData.price,
    samplingPoints: formData.samplingPoints,
    dateTime: formData.dateTime,
    dateTimeSubmitted: new Date().toLocaleString(),
  };

  // Check if data.json exists and is not empty
  fs.readFile(dataFilePath, (err, data) => {
    let jsonData = [];

    if (err || !data || data.toString().trim() === "") {
      // If data.json doesn't exist or is empty, create a new file with an empty array
      console.log("data.json not found or is empty, creating new file...");
      jsonData = [];
    } else {
      // If the file exists, parse the JSON data
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing data.json:", parseError);
        return res.status(500).send("Error parsing data.");
      }
    }

    // Add the new data to the array
    jsonData.push(dataToSubmit);

    // Write the updated data to data.json
    fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to data.json:", err);
        return res.status(500).send("Error saving data.");
      }

      console.log("Data saved successfully to data.json.");
      return res.status(200).send("Data saved successfully.");
    });
  });
});


app.get('/history', (req, res) => {
    const { page = 1, limit = 10, fromDate, toDate } = req.query;
  
    fs.readFile(dataFilePath, (err, data) => {
      if (err) return res.status(500).send('Error reading data file');
  
      let jsonData = JSON.parse(data);
  
      // Filter by date range if provided
      if (fromDate && toDate) {
        jsonData = jsonData.filter((item) => {
          const itemDate = new Date(item.dateTimeSubmitted);
          return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
        });
      }
  
      // Apply pagination
      const totalPages = Math.ceil(jsonData.length / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedData = jsonData.slice(startIndex, endIndex);
  
      res.json({
        records: paginatedData,
        totalPages,
      });
    });
  });

  app.get("/history/:searchId?", (req, res) => {
    const searchId = req.params.searchId || ''; // If no searchId is provided, it will be an empty string
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    // Read data from JSON file
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
  
      // Apply filtering based on searchId (ID_Inspect starts with search term)
      if (searchId) {
        jsonData = jsonData.filter((record) =>
          record.ID_Inspect && record.ID_Inspect.startsWith(searchId)
        );
      }
  
      // Apply date range filter if provided
      if (fromDate && toDate) {
        jsonData = jsonData.filter((record) => {
          const recordDate = new Date(record.dateTime);
          const from = new Date(fromDate);
          const to = new Date(toDate);
          return recordDate >= from && recordDate <= to;
        });
      }
  
      // Implement pagination
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
    const { id } = req.params;  // Extract ID from the URL parameter
  
    fs.readFile(dataFilePath, (err, data) => {
      if (err) {
        console.error("Error reading data file:", err);
        return res.status(500).send("Error reading data.");
      }
  
      let jsonData = [];
  
      if (data) {
        try {
          jsonData = JSON.parse(data);  // Parse the data from the file
        } catch (parseError) {
          console.error("Error parsing data:", parseError);
          return res.status(500).send("Error parsing data.");
        }
      }
  
      // Find the record with the matching ID
      const index = jsonData.findIndex((record) => record.ID === id);
  
      if (index === -1) {
        return res.status(404).send("Record not found");
      }
  
      // Remove the record from the array
      jsonData.splice(index, 1);
  
      // Write the updated data back to the file
      fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error("Error writing data:", err);
          return res.status(500).send("Error saving data.");
        }
  
        return res.status(200).send("Record deleted successfully");
      });
    });
  });
  
  
  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
