import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditResult.css";

function EditResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    note: "",
    price: "",
    dateTime: "",
    samplingPoints: [],
  });

  const samplingOptions = ["Front End", "Back End", "Other"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/result/${id}`);
        const data = response.data;
        console.log(data);
        setFormData({
          note: data.note || "",
          price: data.price || "",
          dateTime: data.dateTime || "",
          samplingPoints: data.samplingPoints || [],
        });
      } catch (error) {
        console.error("Error fetching inspection data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (option) => {
    setFormData((prevData) => {
      const newPoints = prevData.samplingPoints.includes(option)
        ? prevData.samplingPoints.filter((item) => item !== option)
        : [...prevData.samplingPoints, option];
      return { ...prevData, samplingPoints: newPoints };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/history/${id}`,
        formData
      );
      console.log(response.data);

      navigate(`/result/${id}`);
    } catch (error) {
      console.error("Error updating inspection data:", error);
    }
  };

  const handleCancel = () => {
    navigate(`/result/${id}`);
  };

  return (
    <div className="edit-result-container">
      <h2>Edit Result (ID: {id})</h2>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Note:</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              max="100000"
              step="0.01"
            />
          </div>

          <div>
            <label>Date/Time of Sampling:</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Sampling Points:</label>
            <div className="sampling-points-container">
              {samplingOptions.map((option) => (
                <label key={option} className="sampling-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.samplingPoints.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-buttons">
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditResult;
