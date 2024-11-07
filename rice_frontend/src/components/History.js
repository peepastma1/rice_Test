import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch } from "react-icons/fa";  // Import the icon
import "./History.css";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const recordsPerPage = 5;

  // Fetch history data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "http://localhost:5000/history";
        if (searchId) {
          url = `http://localhost:5000/history/${searchId}`;
        }

        const params = {
          page: currentPage,
          limit: recordsPerPage,
          fromDate: dateRange.from,
          toDate: dateRange.to,
        };

        const response = await axios.get(url, { params });

        if (response.data.records.length === 0) {
          setHistory([]);
        } else {
          setHistory(response.data.records);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistory([]);
      }
    };

    fetchData();
  }, [currentPage, searchId, dateRange]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCreateInspection = () => {
    navigate("/create-inspection");
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prevRange) => ({ ...prevRange, [name]: value }));
  };

  const handleCheckboxChange = (id) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDelete = async () => {
    try {
      for (const id of selectedRecords) {
        const url = `http://localhost:5000/history/${id}`;
        await axios.delete(url);
      }

      setCurrentPage(1);
      fetchData();
      setSelectedRecords([]);
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
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Navigate to the result page
  const handleRowClick = (id) => {
    navigate(`/result/${id}`);
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
                className="clear-filters"
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
            <th>View Result</th> {/* New column for the icon */}
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No records found.
              </td>
            </tr>
          ) : (
            history.map((record) => (
              <tr key={record.ID}>
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
                <td>{record.ID}</td>
                <td>{record.name}</td>
                <td>{record.standard}</td>
                <td>{record.note}</td>
                <td>
                  <button
                    className="view-result-btn"
                    onClick={() => handleRowClick(record.ID)}
                  >
                    <FaSearch />
                  </button>
                </td>
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
