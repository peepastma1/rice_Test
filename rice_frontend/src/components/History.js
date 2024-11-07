import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import "./History.css";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const recordsPerPage = 5; // Number of records to show per page

  // Fetch history records with pagination, search, and date filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "http://localhost:5000/history"; // Default URL for all records

        // If there's a searchId, update the URL to fetch specific inspection ID
        if (searchId) {
          url = `http://localhost:5000/history/${searchId}`; // URL for searching by ID_Inspect
        }

        const params = {
          page: currentPage,
          limit: recordsPerPage,
          fromDate: dateRange.from,
          toDate: dateRange.to,
        };

        const response = await axios.get(url, { params });

        // If no records are found, clear the table
        if (response.data.records.length === 0) {
          setHistory([]);
        } else {
          setHistory(response.data.records);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistory([]); // Clear history on error
      }
    };

    fetchData();
  }, [currentPage, searchId, dateRange]);

  // Handle search by ID
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCreateInspection = () => {
    navigate("/create-inspection");
  };

  // Handle date range filter
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prevRange) => ({ ...prevRange, [name]: value }));
  };

  // Handle record selection for deletion
  const handleCheckboxChange = (id) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle bulk delete
  const handleDelete = async () => {
    try {
      // Loop through each selected record and send a DELETE request for each
      for (const id of selectedRecords) {
        const url = `http://localhost:5000/history/${id}`;  // DELETE request to the correct endpoint
        await axios.delete(url); // DELETE request with ID in the URL
      }

      setCurrentPage(1);
  
      // After deletion, re-fetch the history to get the updated data
      fetchData();  // This function will fetch the updated records from the server
      setSelectedRecords([]); // Clear selection
  
    } catch (error) {
      console.error("Error deleting records:", error);
    }
  };

  const fetchData = async () => {
    try {
      const params = {
        page: currentPage,
        limit: recordsPerPage,
        id: searchId,
        fromDate: dateRange.from,
        toDate: dateRange.to,
      };
  
      const response = await axios.get("http://localhost:5000/history", { params });
      setHistory(response.data.records);
      setTotalPages(response.data.totalPages); // Update the total number of pages
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
  

  // Navigate to the result page
  const handleRowClick = (id) => {
    // navigate(`/result/${id}`);
  };

  // Render pagination controls
  const renderPagination = () => (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="history-container">
      <div className="header">
        <h2>History</h2>
        <button className="create-inspection-btn" onClick={handleCreateInspection}>
          + Create Inspection
        </button>
      </div>
      {/* Search and Filter Section */}
      
      <div className="filter-block">
        <div className="filter-section">
          <div className="search-form">
            <div className="search-input-group">
              <div className="label-input">
                <label htmlFor="search-id">ID</label>
                <input
                  id="search-id"
                  type="text"
                  placeholder="Search by Inspection ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>

              <div className="label-input">
                <label htmlFor="from">From Date</label>
                <input
                  id="from"
                  type="date"
                  name="from"
                  value={dateRange.from}
                  onChange={handleDateChange}
                />
              </div>

              <div className="label-input">
                <label htmlFor="to">To Date</label>
                <input
                  id="to"
                  type="date"
                  name="to"
                  value={dateRange.to}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            <div className="search-button-group">
              <button
                className="clear-filters" // Apply the class for red color and right alignment
                onClick={() => {
                  setSearchId("");
                  setDateRange({ from: "", to: "" });
                }}
              >
                Clear Filters
              </button>
              <button onClick={handleSearch}>
                <FaSearch /> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button disabled={!selectedRecords.length} onClick={handleDelete}>
        Delete Selected
      </button>

      {/* History Table */}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Create Date - Time</th>
            <th>Inspection ID</th>
            <th>Name</th>
            <th>Standard</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No records found.
              </td>
            </tr>
          ) : (
            history.map((record) => (
              <tr key={record.ID} onClick={() => handleRowClick(record.ID)}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRecords.includes(record.ID)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(record.ID);
                    }}
                  />
                </td>
                <td>{record.dateTimeSubmitted}</td>
                <td>{record.ID_Inspect}</td>
                <td>{record.name}</td>
                <td>{record.standard}</td>
                <td>{record.note}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {history.length > 0 && renderPagination()}
    </div>
  );
}

export default History;
