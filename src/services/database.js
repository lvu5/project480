import axios from "axios";
const baseUrl = 'http://localhost:3001/api'

const getTable = async (tableName) => {
    const request = await axios.get(`${baseUrl}/get/${tableName}`)
    return request.data
}

const insert = (newObject, tableName) => {
    const request = axios.post(`${baseUrl}/post/${tableName}`, newObject)
    return request.then(response => response.data)
}

// delete a row 
const deleteRow = (deleteObject, tableName) => {
    // axios delete request with the where clause as the first object in the deleteObject
    const request = axios.delete(`${baseUrl}/delete/${tableName}`, {data: deleteObject})
    return request.then(response => response.data)
}

const updateRow = (updateObject, tableName) => {
    const request = axios.put(`${baseUrl}/update/${tableName}`, updateObject)
    return request.then(response => response.data)
}

// find rows that match the where clause
const find = (whereClause, tableName) => {
    const request = axios.get(`${baseUrl}/find/${tableName}`, {params: whereClause})
    return request.then(response => response.data)
}

const nestedFind = (object) => {
    const request = axios.get(`${baseUrl}/nestedFind`, {params: object})
    return request.then(response => response.data)
}


export default { getTable, insert, deleteRow, updateRow, find, nestedFind }