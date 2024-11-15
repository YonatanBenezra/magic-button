import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [table, setTable] = useState([]);
  const [error, setError] = useState("");

  const processFile = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      try {
        const groupedData = groupStudents(data);
        setTable(groupedData);
        setError("");
      } catch (err) {
        setError("Error processing the file. Please check its format.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const groupStudents = (data) => {
    const numGroups = 3;
    const groups = Array.from({ length: numGroups }, () => ({
      students: [],
      totalScore: 0,
      femaleCount: 0,
    }));

    const females = data.filter((student) => student.Gender === "Female");
    const males = data.filter((student) => student.Gender === "Male");

    females.forEach((female, index) => {
      const targetGroup = groups[index % numGroups];
      targetGroup.students.push(female);
      targetGroup.femaleCount += 1;
      targetGroup.totalScore += female.Total || 0;
      female.Group = `Group ${index % numGroups + 1}`;
    });

    males.forEach((male, index) => {
      const targetGroup = groups[index % numGroups];
      targetGroup.students.push(male);
      targetGroup.totalScore += male.Total || 0;
      male.Group = `Group ${index % numGroups + 1}`;
    });

    return data.map((student) => {
      const assignedStudent = groups
        .flatMap((group) => group.students)
        .find((s) => s.Email === student.Email);
      return { ...student, Group: assignedStudent.Group };
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const copyGroupColumn = () => {
    const groupColumnData = table.map((row) => row.Group).join("\n");
    navigator.clipboard.writeText(groupColumnData)
      .then(() => alert("Group column copied to clipboard!"))
      .catch((err) => alert("Failed to copy: " + err));
  };

  const triggerFileInput = () => {
    document.getElementById("file-input").click();
  };

  return (
    <div className="App">
      <h1>The magic button</h1>
      <h4>Upload the xlsx file like you sent me without the students being divided in to groups then click on Copy group column and paste it in to your file.</h4>
      
      {/* Hidden file input */}
      <input 
        id="file-input" 
        type="file" 
        accept=".xlsx" 
        onChange={handleFileUpload} 
        style={{ display: "none" }} 
      />
      
      {/* Custom upload button */}
      <button onClick={triggerFileInput} style={{ 
        color: "white", 
        backgroundColor: "red", 
        padding: "10px 20px", 
        border: "none", 
        borderRadius: "5px", 
        cursor: "pointer", 
        fontSize: "16px",
        fontWeight: "bold" 
      }}>
        Upload File
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {table.length > 0 && (
        <>
          <button onClick={copyGroupColumn} style={{ marginBottom: "10px" }}>
            Copy Group Column
          </button>
          <table border="1" style={{ width: "100%", marginTop: "20px" }}>
            <thead>
              <tr>
                {Object.keys(table[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
