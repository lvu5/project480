require('dotenv').config()
const express = require('express')
const db = require('./db')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())


const filterEmptyKeys = (obj) => {
    console.log("function here", obj)
    const dataObjectKeys = Object.keys(obj)
    const dataObjectValues = Object.values(obj)
    const dataObjectFiltered = dataObjectKeys.filter((key, i) => {
        return dataObjectValues[i] !== "" && dataObjectValues[i] !== 'None'
    })
    const dataObjectFilteredObject = dataObjectFiltered.reduce((acc, curr) => {
        return { ...acc, [curr]: obj[curr] }
    }
        , {})
    return dataObjectFilteredObject
}

app.get('/getget', (req, res) => {
    res.send('hi World!')
})

app.get("/api/get/:table", (request, response) => {
    const table = request.params.table
    console.log(table)
    db.query(`SELECT * FROM ${table}`, (err, result) => {
        if (err) {
            console.log(err)
            console.log("doesn't work")
        } else {
            response.json(result)
            console.log(result)
        }
    })
})

app.post("/api/post/:table", (request, response) => {
    const table = request.params.table
    const data = request.body
    const n = Object.keys(data).length
    const query = `INSERT INTO ${table} VALUES (${Array(n).fill('?').join(',')})`
    db.query(query, Object.values(data), (err, result) => {
        if (err) {
            console.log(err)
            console.log("doesn't work")
        } else {
            response.json(result)
            console.log(result)
        }
    })
})

app.delete("/api/delete/:table", (request, response) => {
    const table = request.params.table
    const data = request.body
    // query to delete a row given data columns
    const query = `DELETE FROM ${table} WHERE ${Object.keys(data).map(key => `${key} = ?`).join(' AND ')}`
    db.query(query, Object.values(data), (err, result) => {
        if (err) {
            console.log(err)
            console.log("doesn't work")
        } else {
            response.json(result)
            console.log(result)
        }
    })
})

app.put("/api/update/:table", (request, response) => {
    const table = request.params.table
    var data = request.body
    data = filterEmptyKeys(data)
    // query to update a row given data columns with the fisrt column is where clause, the rest are set values
    const query = `UPDATE ${table} SET ${Object.keys(data).slice(1).map(key => `${key} = ?`).join(', ')} WHERE ${Object.keys(data)[0]} = "${Object.values(data)[0]}"`
    db.query(query, Object.values(data).slice(1), (err, result) => {
        if (err) {
            console.log(err)
            console.log("doesn't work")
        } else {
            response.json(result)
            console.log(result)
        }
    }
    )
})

app.get("/api/find/:table", (request, response) => {
    const table = request.params.table
    const data = request.query
    // query to find a row given data columns
    const query = `SELECT * FROM ${table} WHERE ${Object.keys(data).map(key => `${key} = ?`).join(' AND ')}`
    db.query(query, Object.values(data), (err, result) => {
        if (err) {
            console.log(err)
            console.log("doesn't work")
        } else {
            response.json(result)
            console.log(result)
        }
    }
    )
})



app.get("/api/nestedFind", (request, response) => {
    const data = request.query
    console.log("NESWTYED FIND DATATATATA",data)
    const filteredData = filterEmptyKeys(data)
    const testString = `WHERE ${Object.keys(filteredData).map(key => `${key} = ?`).join(' AND ')}`
    const testString1 = `WHERE ${Object.keys(filteredData).map(key => `${key} != ?`).join(' AND ')}`
    console.log(Object.values(filteredData))
    const testArray = Object.values(filteredData).concat(Object.values(filteredData))
    // check all element in testArray equals to a condition
    // loop for i in testArray
    var checkArr = true
    for (let i = 0; i < testArray.length; i++) {
        // if all None then checkArr = false
        if (testArray[i] !== 'None') {
            checkArr = false
            break
        }
    }


    const query = `SELECT dorm.dorm_id, Student.name, Student.student_id, Student.class_standing, Student.email, student.department
                    FROM Dorm
                    JOIN Room ON Dorm.dorm_ID = Room.dorm_ID
                    JOIN Student ON Room.room_id = Student.room_id
                    ${testString}
                    AND Student.name NOT IN (
                        SELECT Student.name
                            FROM Dorm
                            JOIN Room ON Dorm.dorm_ID = Room.dorm_ID
                            JOIN Student ON Room.room_id = Student.room_id
                            ${testString1}
                        )`
    if (checkArr) {
        db.query(`SELECT * FROM student`, (err, result) => {
            if (err) {
                console.log(err)
                console.log("doesn't work")
            } else {
                response.json(result)
                console.log(result)
            }
        })
    }
    else{       
        db.query(query, testArray, (err, result) => {
            if (err) {
                console.log(err)
                console.log("doesn't work")
            } else {
                response.json(result)
                console.log(result)
            }
        })
    }
})
    
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    }
)