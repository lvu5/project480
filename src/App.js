import React from "react";
import './index.css'
import {useState} from 'react';
import dbServer from './services/database.js';
import jsPDF from "jspdf";
import html2canvas from 'html2canvas';

function App() {
  const [selectDatabase, setDatabase] = useState([]);
  const [menuData, setMenuData] = useState('');
  const [radioData, setRadioData] = useState({});
  var numButtons = 6;

  const filterEmptyKeys = (obj) => {
    const dataObjectKeys = Object.keys(obj)
    const dataObjectValues = Object.values(obj)
    const dataObjectFiltered = dataObjectKeys.filter((key, i) => {
      return dataObjectValues[i] !== ""
    })
    const dataObjectFilteredObject = dataObjectFiltered.reduce((acc, curr) => {
      return { ...acc, [curr]: obj[curr] }
    }
      , {})
    return dataObjectFilteredObject
  }

  const getOption = async (e) => {
    dbServer.getTable(e.target.value).then(data => {
      setDatabase(data)
    })
    setMenuData(e.target.value)
  }

  const mapToTable = (data) => {
    const columns = Object.keys(data[0])
    const rows = data.map(row => {
      const rowData = Object.values(row)
      return rowData
    })
    return (
      <table id="output">
        <thead>
          <tr>
            {columns.map(column => {
              return <th key={column.id}>{column}</th>
            }
            )}        
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            return (
              <tr>
                {row.map(cell => {
                  return <td key={cell.id}>{cell}</td>
                }
                )}
              </tr>
            )
          }
          )}
        </tbody>
      </table>
    )
  }

  const printDocument = () => {
    const input = document.getElementById('output');
    html2canvas(input).then((canvas) => {
      var imgWidth = 200;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4')
      var position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      console.log(menuData)
      pdf.save(`${menuData}.pdf`)
    })
  }

  const getData = async (e) => {
    e.preventDefault()
    const data = Array.from(e.target).slice(0, -numButtons).map((input, i) => {
        return {[input.name]: input.value}
    })
    const dataObject = data.reduce((acc, curr) => {
      return {...acc, ...curr}
    }
    , {})
  // once get data, determine the button action
    const buttonAction = e.nativeEvent.submitter.id
    console.log(data)
    if (buttonAction === "insertBtn") {
        dbServer.insert(dataObject, menuData).then(data => {
        console.log("insert success")
        alert("Successfully added!")
        dbServer.getTable(menuData).then(data => {
          setDatabase([...data])
        })
      })
    }

    if (buttonAction === "deleteBtn") {
      const dataObjectFilteredObject = filterEmptyKeys(dataObject)
      console.log(dataObjectFilteredObject)
      dbServer.deleteRow(dataObjectFilteredObject, menuData).then(data => {
        console.log("delete success")
        alert("Successfully deleted!")
        dbServer.getTable(menuData).then(data => {
          setDatabase([...data])
        }
        )
      })
    }
    
    if (buttonAction == "updateBtn") {
      console.log("here working")
      dbServer.updateRow(dataObject, menuData).then(data => {
        console.log("update success")
        alert("Successfully updated!")
        dbServer.getTable(menuData).then(data => {
          setDatabase([...data])
        })
      })
    }

    if (buttonAction == "printBtn") {
      printDocument()
    }

    if (buttonAction == "findBtn") {
      const dataObjectFilteredObject = filterEmptyKeys(dataObject)
      dbServer.find(dataObjectFilteredObject, menuData).then(data => {
        console.log("find success")
        setDatabase(data)
      })
    }
    
    if (buttonAction == "listBtn") {
      console.log("working")
      dbServer.getTable(menuData).then(data => {
        console.log('listing success')
        setDatabase([...data])
        if (menuData == "student") {
          const a = document.getElementById("radio-form")
          a.checked = false
          setRadioData({})
        }
        
      }
      )
    }

  }

  const mapToInputs = (data) => {
    const columns = Object.keys(data[0])
    const inputs = columns.map(column => {
      return (
        <div key={column.id}>
          <label htmlFor={column}>{column}</label>
          <input type="text" id={column} name={column}/>
        </div>
      )
    })
    return (inputs)
  }

  // Dorm filter radio buttons include dorm-id input from database table
  const dormFilter = (data) => {
    const dorms = data.map(row => {
      return row.dorm_id
    })
    // I love you Nghi <3 ❤️ ❤️❤️ ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
    var dormsUnique = []
    dormsUnique.push("None")
    const uniqlo = [...new Set(dorms)]
    dormsUnique = dormsUnique.concat(uniqlo)
    
    const dormsRadio = dormsUnique.map(dorm => {
      return (
        <div>
          <input type="radio" name="dorm.dorm_id" value={dorm}/>
          <label htmlFor={dorm}>{dorm}</label>
        </div>
      )
    }
    )
    return (dormsRadio)
  }

  // Class standing filter radio buttons include student class standing input from database table
  const classStandingFilter = (data) => {
    const classStandings = data.map(row => {
      return row.class_standing
    }
    )
    // repeat above please
    var classStandingsUnique = []
    classStandingsUnique.push("None")
    const uniqlo = [...new Set(classStandings)]
    classStandingsUnique = classStandingsUnique.concat(uniqlo)

    const classStandingsRadio = classStandingsUnique.map(classStanding => {
      return (
        <div>
          <input type="radio" name="student.class_standing" value={classStanding}/>
          <label htmlFor={classStanding}>{classStanding}</label>
        </div>
      )
    }
    )
    return (classStandingsRadio)
  }

   // Department filter radio buttons include student department input from database table
  const departmentFilter = (data) => {
    const departments = data.map(row => {
      return row.department
    }
    )
    // again please
    var departmentsUnique = []
    departmentsUnique.push("None")
    const uniqlo = [...new Set(departments)]
    departmentsUnique = departmentsUnique.concat(uniqlo)
    const departmentsRadio = departmentsUnique.map(department => {
      return (
        <div>
          <input type="radio" name="student.department" value={department}/>
          <label htmlFor={department}>{department}</label>
        </div>
      )
    }
    )
    return (departmentsRadio)
  }
// get radio button values from radio-form form
  const getRadio = (e) => {
    radioData[e.target.name] = e.target.value
    setRadioData(radioData)
    console.log(radioData)
    dbServer.nestedFind(radioData).then(data => {
      setDatabase([...data])
    })
  }

  return (
    <div className="body">
      {/* HEADER */}
      <div className="header">
        <h1>🏡DORMITORY MANAGER🏰</h1>
      </div>
      {/* BODY */}
      <div className="input-form">
        <p>
          <b>Enter Details</b>
          <br/>
          Please fill in all information to be able to perform the task.
          For the <b>FIND</b> task, you <b>do not</b> need to fill in all the information.
        </p>
          
        {/* INPUT DATABASE */}

        {/* Dropdown menu, this is to display the options to input data into a selected database
        The options are the names of the databases in the database. */}
        <div className="input-box">
          <div className="database-option-dropdown">
            <label><b>🌟Database:</b></label>    
            <select onChange={getOption} name="database" id="dropdown-menu">
              <option value="0"></option>
              <option value="dorm">Dormitory</option>
              <option value="room">Room</option>
              <option value="employee">Employee</option>
              <option value="manager">Dorm Manager</option>
              <option value="housing_worker">Housing Worker</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Form with input to submit information */}
          <div className="input-detail">
              {/* Inputs for the data to be inputted */}
              <form id="input-form" onSubmit={getData}>
                {menuData !== '0' && selectDatabase.length !== 0 && mapToInputs(selectDatabase)}
              </form>
          </div>
        </div>
        {/* BUTTON */}
        {/* Tasks buttons */}
        <div className="button-container">
          <button type="submit" id="deleteBtn" className="btn" form="input-form">Delete</button>
          <button type="submit" id="insertBtn" className="btn" form="input-form">Insert</button>
          <button type="submit" id="updateBtn" className="btn" form="input-form">Update</button>
          <button type="submit" id="findBtn" className="btn" form="input-form">Find</button>
          <button type="submit" id="printBtn" className="btn" form="input-form">Print</button>
          <button type="submit" id="listBtn" className="btn" form="input-form">List</button>
        </div>
      </div> 
      
      {/* If menu data is student, then display the radio buttons for dorm_id, class standing and department filter */}
      {menuData === 'student' &&
        <div className="radio-button">
          <form id="radio-form" onChange={getRadio}>
            <div className="radio-button-container">
              <label><b>Dorm Filter:</b></label>
              {selectDatabase.length !== 0 && dormFilter(selectDatabase)}
            </div>
            <div className="radio-button-container">
              <label><b>Class Standing Filter:</b></label>
              {selectDatabase.length !== 0 && classStandingFilter(selectDatabase)}
            </div>
            <div className="radio-button-container">
              <label><b>Department Filter:</b></label>
              {selectDatabase.length !== 0 && departmentFilter(selectDatabase)}
            </div>
          </form>
        </div>
      }

      {/* OUTPUT DATABASE */}
      {/* If find button state is false then show databasem otherwise show mapToTable */}
      <div className="output">
      {selectDatabase.length !== 0 && mapToTable(selectDatabase)}
      </div>

      <div className="footer">
        <p>
          <b>UIC 2022 | CS 480 - 19865</b>
          <br />
          <b>Created by Trong Linh Vu and Hoang Bao Nghi Bien</b>
        </p>
      </div>
    </div>
  );
}

export default App;
