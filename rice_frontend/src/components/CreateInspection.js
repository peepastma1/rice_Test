import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateInspection.css"; // Import the CSS file

function CreateInspection() {
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
    // Fetch standards from the provided URL
    axios
      .get(
        "https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/standards.json"
      )
      .then((response) => {
        // Set standards to the fetched data
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
    // Submit the form data
    axios
      .post("/api/history", formData)
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
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
          <div>
            {["Front End", "Back End", "Other"].map((point) => (
              <label key={point}>
                <input
                  type="checkbox"
                  value={point}
                  onChange={handleSamplingPointChange}
                />
                {point}
              </label>
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
            <button type="button" className="cancel-btn">
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
