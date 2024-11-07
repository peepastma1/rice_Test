import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateInspection.css";
import { useNavigate } from "react-router-dom";

function CreateInspection() {
  const navigate = useNavigate();
  const [standards, setStandards] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    standard: "",
    note: "",
    price: "",
    samplingPoints: [],
    dateTime: "",
    upload: null,
  });

  useEffect(() => {
    axios
      .get(
        "https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/standards.json"
      )
      .then((response) => {
        setStandards(response.data);
      })
      .catch((error) => {
        console.error("Error fetching standards:", error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSamplingPointChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevState) => {
      const samplingPoints = checked
        ? [...prevState.samplingPoints, value]
        : prevState.samplingPoints.filter((point) => point !== value);
      return { ...prevState, samplingPoints };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // If a file is uploaded, process the JSON file
    if (formData.upload) {
      const file = formData.upload;
  
      // Create a FileReader to read the file
      const reader = new FileReader();
  
      reader.onload = (event) => {
        try {
          // Parse the JSON data from the file
          const jsonData = JSON.parse(event.target.result);
  
          // Extract requestID from the JSON
          const requestID = jsonData.requestID;
  
          // Log the form data
          const currentDateTime = new Date();
          const formattedDateTime = currentDateTime.toLocaleString();
  
          console.log("Name:", formData.name);
          console.log("Standard:", formData.standard);
          console.log("Name of File:", file.name); // File name from the upload
          console.log("Note:", formData.note);
          console.log("Price:", formData.price);
          console.log("Sampling Points:", formData.samplingPoints.join(", "));
          console.log("Date/Time:", formData.dateTime);
          console.log("Date/Time Submitted:", formattedDateTime);
  
          // Log the Request ID from the uploaded JSON
          console.log("Request ID from uploaded JSON:", requestID);


          const dataToSubmit = {
            ID_Inspect: requestID,
            name: formData.name,
            standard: formData.standard,
            upload: formData.upload ? formData.upload.name : null,
            note: formData.note,
            price: formData.price,
            samplingPoints: formData.samplingPoints,
            dateTime: formData.dateTime,
            dateTimeSubmitted: formattedDateTime,
          };

          console.log(dataToSubmit);
        
          // Send the form data to the backend
          axios
            .post("http://localhost:5000/history", dataToSubmit)
            .then((response) => console.log(response))
            .catch((error) => console.error(error));
  
        } catch (error) {
          console.error("Error reading or parsing JSON file:", error);
        }
      };
  
      // Read the file as text (expecting JSON format)
      reader.readAsText(file);
      navigate("/history"); 

      
    } else {
      console.log("No file uploaded.");
    }
  };
  

  const handleCancel = () => {
    navigate("/history"); // Navigate to the history page
  };

  return (
    <div>
      <h1 className="form-title">Create Inspection</h1>
      <div className="form-container">
        <form onSubmit={handleSubmit} className="inspection-form">
          <label>Name (required):</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <label>Standard (required):</label>
          <select
            name="standard"
            value={formData.standard}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Standard</option>
            {standards.map((standard) => (
              <option key={standard.id} value={standard.name}>
                {standard.name}
              </option>
            ))}
          </select>

          <label>Note:</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
          />

          <label>Price (0 - 100,000):</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            max="100000"
            step="0.01"
          />

          <label>Sampling Points:</label>
          <div className="sampling-points-container">
            {["Front End", "Back End", "Other"].map((point) => (
              <div key={point} className="sampling-point">
                <input
                  type="checkbox"
                  value={point}
                  onChange={handleSamplingPointChange}
                />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <label>Date/Time of Sampling:</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleInputChange}
          />

          <label>Upload (.json):</label>
          <input
            type="file"
            accept=".json"
            onChange={(e) =>
              setFormData({ ...formData, upload: e.target.files[0] })
            }
          />

          <div className="button-container">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateInspection;
