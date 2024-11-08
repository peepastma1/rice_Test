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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let selectedStandardData = [];
    const selectedStandard = standards.find(
      (standard) => standard.name === formData.standard
    );
  
    if (selectedStandard) {
      selectedStandardData = selectedStandard.standardData;
    }
  
    if (formData.upload) {
      const file = formData.upload;
      const reader = new FileReader();
  
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          const requestID = jsonData.requestID;
          const imageURL = jsonData.imageURL;
          // const currentDateTime = new Date().toLocaleString();
          const currentDateTime = new Date();
  
          const totalWeight = jsonData.grains.reduce(
            (total, grain) => total + grain.weight,
            0
          );
          const totalGrains = jsonData.grains.length;
  
          const typeWeightSum = jsonData.grains.reduce((acc, grain) => {
            acc[grain.type] = (acc[grain.type] || 0) + grain.weight;
            return acc;
          }, {});
  
          const typeweight = Object.keys(typeWeightSum).reduce((acc, type) => {
            acc[type] = ((typeWeightSum[type] / totalWeight) * 100).toFixed(2);
            return acc;
          }, {});
  
          const ShapeWeightSum = {};
  
          selectedStandardData.forEach((standard) => {
            const { minLength, maxLength, conditionMin, conditionMax, shape, name } = standard;
  
            const matchingGrains = jsonData.grains.filter((grain) => {
              const isShapeMatch = shape.includes(grain.shape);
              // if (!isShapeMatch) {
              //   console.log(`Shape mismatch for grain shape ${grain.shape} in standard ${name}`);
              // }
  
              const isMinConditionMet =
                (conditionMin === "GT" && grain.length > minLength) ||
                (conditionMin === "GE" && grain.length >= minLength);
  
              const isMaxConditionMet =
                (conditionMax === "LT" && grain.length < maxLength) ||
                (conditionMax === "LE" && grain.length <= maxLength);
  
              // if (!isMinConditionMet || !isMaxConditionMet) {
              //   console.log(
              //     `Length mismatch for grain shape ${grain.shape} in standard ${name}: ` +
              //     `minCondition: ${isMinConditionMet}, maxCondition: ${isMaxConditionMet}`
              //   );
              // }
  
              return isShapeMatch && isMinConditionMet && isMaxConditionMet;
            });
  
            const sumWeight = matchingGrains.reduce(
              (sum, grain) => sum + grain.weight,
              0
            );
  
            // console.log(`Sum weight for ${name}: ${sumWeight}`);
  
            const weightPercentage = ((sumWeight / totalWeight) * 100).toFixed(2);
  
            ShapeWeightSum[name] = weightPercentage;
          });
  
          // console.log(ShapeWeightSum);

          const dataToSubmit = {
            ID_Inspect: requestID,
            name: formData.name,
            standard: formData.standard,
            imgUrl: imageURL,
            upload: formData.upload ? formData.upload.name : null,
            note: formData.note,
            price: formData.price,
            samplingPoints: formData.samplingPoints,
            dateTime: formData.dateTime,
            dateTimeSubmitted: currentDateTime,
            lastTimeUpdated: currentDateTime,
            standardData: selectedStandardData,
            typeweight: typeweight,
            shapeweight: ShapeWeightSum,
            totalGrains: totalGrains,
          };
  
          // console.log("Data to submit:", dataToSubmit);
  
          axios
            .post("http://localhost:5000/history", dataToSubmit)
            .then((response) => {
              // console.log("Data submitted:", response.data);
              const { id } = response.data;
              navigate(`/result/${id}`);
            })
            .catch((error) => console.error("Submission error:", error));
        } catch (error) {
          console.error("Error reading or parsing JSON file:", error);
        }
      };
  
      reader.readAsText(file);
    } else {
      console.log("No file uploaded.");
      alert("No file uploaded.");
    }
  };
  
  
  const handleCancel = () => {
    navigate("/history");
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
            <button type="button" className="cancel-btn" onClick={handleCancel} style={{ backgroundColor: "#f44336", color: "white" }}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" style={{ backgroundColor: "#4caf50", color: "white" }}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateInspection;
