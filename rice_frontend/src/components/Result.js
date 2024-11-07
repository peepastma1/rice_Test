import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Result.css";

function Result() {
  const { id } = useParams(); // Get the ID from URL
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [inspectionData, setInspectionData] = useState(null);

  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        // Fetch the inspection data by ID from the API
        const response = await axios.get(`http://localhost:5000/result/${id}`);
        setInspectionData(response.data);
      } catch (error) {
        console.error("Error fetching inspection data:", error);
      }
    };

    fetchInspectionData();
  }, [id]);

  if (!inspectionData) {
    return <div>Loading...</div>;
  }

  // Destructure the inspection data
  const {
    name,
    standard,
    imgUrl,
    note,
    price,
    dateTime,
    samplingPoints,
    dateTimeSubmitted,
    standardData,
    typeweight,
    shapeweight,
    dateLastUpdate,
    totalGrains,
  } = inspectionData;

  // Calculate total weight excluding "white"
  const totalWeight = Object.keys(typeweight).reduce((acc, type) => {
    if (type !== "white") {
      acc += parseFloat(typeweight[type]);
    }
    return acc;
  }, 0);

  // Function to format date to dd/mm/yyyy hh:mm
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Render the page with the inspection data
  return (
    <div className="result-page">
      <div className="left-side">
        <img src={imgUrl} alt={name} width="200" />
        <button onClick={() => window.history.back()}>Back</button>
        {/* Add the Edit button */}
        <button onClick={() => navigate(`/edit/${id}`)}>Edit</button>
        <button onClick={() => navigate(`/history`)}>History</button>
      </div>

      <div className="right-side">
        <div className="info-block">
          <h3>Inspection Information</h3>
          <p>
            <strong>Inspection ID:</strong> {id}
          </p>
          <p>
            <strong>Total of Sample:</strong> {totalGrains}
          </p>
          <p>
            <strong>Standard:</strong> {standard}
          </p>
          <p>
            <strong>Created Date-Time:</strong> {formatDate(dateTimeSubmitted)}
          </p>
          <p>
            <strong>Update Date-Time:</strong> {formatDate(dateLastUpdate)}
          </p>
        </div>

        <div className="info-block">
          <h3>Additional Information</h3>
          <p>
            <strong>Note:</strong> {note}
          </p>
          <p>
            <strong>Price:</strong> {price}
          </p>
          <p>
            <strong>Sampling Date:</strong> {formatDate(dateTime)}
          </p>{" "}
          {/* Format the sampling date */}
          <p>
            <strong>Sampling Points:</strong> {samplingPoints.join(", ")}
          </p>
        </div>

        <div className="info-block">
          <h3>Composition</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Length</th>
                <th>Actual</th>
              </tr>
            </thead>
            <tbody>
              {standardData.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{`${item.minLength} - ${item.maxLength}`}</td>
                  <td>
                    {/* Display the actual shapeweight percentage based on the name */}
                    {shapeweight[item.name]
                      ? `${shapeweight[item.name]}%`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-block">
          <h3>Defect Rice</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {/* Loop through typeweight object and display each type excluding "white" */}
              {Object.keys(typeweight).map((type, index) => {
                if (type !== "white") {
                  return (
                    <tr key={index}>
                      <td>{type}</td>
                      <td>{typeweight[type]}%</td>
                    </tr>
                  );
                }
                return null;
              })}
              {/* Display total weight excluding "white" */}
              <tr>
                <td>Total (Excluding White)</td>
                <td>{totalWeight.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Result;
