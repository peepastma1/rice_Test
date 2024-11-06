import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Result() {
  const { id } = useParams(); // Gets the inspection ID from the URL
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState({});
  const [grains, setGrains] = useState([]);
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch raw.json for grain data and image URL
        const rawResponse = await axios.get('https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/raw.json');
        const rawData = rawResponse.data;

        setImageURL(rawData.imageURL);
        setGrains(rawData.grains);

        // Fetch the specific inspection data by ID from the backend
        const inspectionResponse = await axios.get(`/api/history/${id}`);
        const inspectionData = inspectionResponse.data;

        // Set Basic Information
        setBasicInfo({
          createdAt: inspectionData.createdAt,
          inspectionId: inspectionData.id,
          standard: inspectionData.standard,
          totalSample: rawData.grains.length, // Total grains
          updatedAt: inspectionData.updatedAt,
          note: inspectionData.note,
          price: inspectionData.price,
          dateTime: inspectionData.dateTime,
          samplingPoints: inspectionData.samplingPoints,
        });
      } catch (error) {
        console.error("Error fetching inspection data:", error);
      }
    };

    fetchData();
  }, [id]);

  // Filtering grains for Composition and Defect Rice tables
  const composition = grains.filter(grain => grain.shape === 'wholegrain');
  const defectRice = grains.filter(grain => grain.type === 'chalky');

  return (
    <div>
      <h2>Result (ID: {id})</h2>

      {/* Basic Information Section */}
      <section>
        <h3>Basic Information</h3>
        {imageURL && <img src={imageURL} alt="Sample Inspection" width="200" />}
        <p><strong>Create Date - Time:</strong> {basicInfo.createdAt}</p>
        <p><strong>Inspection ID:</strong> {basicInfo.inspectionId}</p>
        <p><strong>Standard:</strong> {basicInfo.standard}</p>
        <p><strong>Total Sample:</strong> {basicInfo.totalSample}</p>
        <p><strong>Update Date - Time:</strong> {basicInfo.updatedAt}</p>
        <p><strong>Note:</strong> {basicInfo.note}</p>

        {/* Optional fields */}
        {basicInfo.price && <p><strong>Price:</strong> {basicInfo.price}</p>}
        {basicInfo.dateTime && <p><strong>Date/Time of Sampling:</strong> {basicInfo.dateTime}</p>}
        {basicInfo.samplingPoints && (
          <p><strong>Sampling Points:</strong> {basicInfo.samplingPoints.join(", ")}</p>
        )}
      </section>

      {/* Inspection Result Section */}
      <section>
        <h3>Inspection Result</h3>
        
        {/* Composition Table */}
        <h4>Composition</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Length</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {composition.map((item, index) => (
              <tr key={index}>
                <td>ข้าวเต็มเมล็ด</td>
                <td>{item.length.toFixed(2)} mm</td>
                <td>{item.weight.toFixed(4)} g</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Defect Rice Table */}
        <h4>Defect Rice</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            {defectRice.map((item, index) => (
              <tr key={index}>
                <td>ข้าวหักทั่วไป</td>
                <td>{item.weight.toFixed(4)} g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Navigation Buttons */}
      <button onClick={() => navigate("/")}>Back</button>
      <button onClick={() => navigate(`/edit/${id}`)}>Edit</button>
    </div>
  );
}

export default Result;
